import {html} from "./hybrids/index.js";
import * as app from "./app.js";
import * as audio from "./audio.js";
import * as keymap from "./keymap.js";

let automator = null;
export let automationInterval = 0.03; // seconds
const automationQueue = new Map();
const automationRequests = [];
const definitionRequests = [];


export function initialize (e) {
processAutomationRequests();
processKeyDefinitionRequests();
app.root.addEventListener("keydown", keymap.globalKeyboardHandler);

console.log("UI initialization complete.");
} // initialize

export function legend ({ _depth=1, label } = {}) {
return html`<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>`;
} // legend

export function commonControls ({ bypass, mix, defaults } = {}) {
//console.debug("common: mix = ", mix);
return html`
${boolean({ name: "bypass", defaultValue: bypass })}
${number("mix", "mix", mix, defaults.mix.min, defaults.mix.max, defaults.mix.step, defaults.mix.type)}
<br>
`; // return
} // commonControls

export function text ({ label, name, defaultValue }) {
if (!label) label = separateWords(name) || "";
return html`<label>${label}: <input type="text" defaultValue="${defaultValue}" onchange="${html.set(name)}"
accesskey="${name[0]}" data-name="${name}"></label>`;
} // text

export function boolean ({ label, name, defaultValue } = {}) {
if (!label) label = separateWords(name) || "";
//console.debug(`boolean: ${name}, ${defaultValue}`);
return html`<button aria-label="${label}"
aria-pressed="${pressed(defaultValue)}"
onclick="${(host,event) => {
host[name] = !defaultValue;
event.target.setAttribute('aria-pressed', pressed(!defaultValue));
//console.debug(`- changed to ${host[name]}, ${event.target.getAttribute('aria-pressed')}`);
 }}"
data-name="${name}"
accesskey="${name[0]}">
${!defaultValue? 'X' : 'O'}
</button>`;

function pressed (value) {return value? "true" : "false";}
} // boolean


export function number (label, name, defaultValue, ...rest) {
let min, max, step, type;
if (rest.length === 1 && rest[0] instanceof Object) {
try {
({ min, max, step, type } = rest[0][name]);
} catch (e) {
console.error(e);
} // catch

} else {
[min, max, step, type] = rest;
} // if

if (name === "mix") console.debug(`ui.number: ${name} default is ${defaultValue}, ${min}, ${max}, ${step}`);
return html`<label>${label}: <input type="${type || 'number'}" defaultValue="${defaultValue}" onchange="${html.set(name)}"
min="${min}" max="${max}" step="${step}"
accesskey="${name[0]}"
data-name="${name}">
</label>`;
} // number



export function list(label, name, defaultValue, options) {
return html`<label>${label}: <select onchange="${html.set(name)}"  accesskey="${name[0]}" data-name="${name}">
${init(options, defaultValue)}
</select></label>`;

function init(options, defaultValue) {
return options.map(option => {
if (isSelected(option, defaultValue)) return (
option instanceof Array? html`<option selected value="${option[1] || option[0]}">${option[0]}</option>`
: html`<option selected value="${option}">${option}</option>`
);
else return (
option instanceof Array? html`<option value="${option[1] || option[0]}">${option[0]}</option>`
: html`<option value="${option}">${option}</option>`
);
}); // map

function isSelected (option, defaultValue) {
if (!defaultValue || typeof(defaultValue) !== "string") return "";
//console.debug(`isSelected: ${option}, ${defaultValue}`);
defaultValue = defaultValue.trim().toLowerCase();
return option instanceof Array?
defaultValue === option[0].toLowerCase().trim() || defaultValue === option[1].toLowerCase().trim()
: defaultValue === option.toLowerCase().trim();
} // isSelected
} // init
} // list



function isNumericInput (input) {
return input.type === "number" || input.type === "range"
} // isNumericInput



function inRange (value, min = 0, max = 1) {
return typeof(min) === "number" && typeof(max) === "number" && typeof(value) === "number" && min <= value <= max;
} // inRange




export function enableAutomation () {
automator = setTimeout(function _tick () {
automationQueue.forEach(e => automate(e));
if (automator) setTimeout(_tick, 1000*automationInterval);
}, 1000*automationInterval); // startAutomation

app.statusMessage(`Automation of ${automationQueue.size} elements enabled.`);
} // enableAutomation

export function disableAutomation () {
clearTimeout(automator);
automator = null;
app.statusMessage("Automation disabled.");
} // disableAutomation

function automate (e) {
if (e.enabled) {
//e.host[e.property] = e.function(audio.context.currentTime);
e.input.value = Number(e.function(audio.context.currentTime));
e.input.dispatchEvent(new CustomEvent("change", {bubbles: false}));
//console.debug(`automate ${e.host._id}.${e.property} = ${e.function(audio.context.currentTime)}`);
} // if
} // automate

function toggleAutomation (input) {
if (automationQueue.has(input)) {
const e = automationQueue.get(input);
e.enabled = !e.enabled;
automationQueue.set(input, e);
app.statusMessage(`${e.enabled? "enabled" : "disabled"} automation for ${e.property}`);
} // if
} // toggleAutomation

export function defineAutomation (input) {
if (!input.dataset.name) return;
if (!input.getRootNode()) return;
const property = input.dataset.name;
const host = input.getRootNode().host;
//console.debug("defining automation for ", host, property);
const labelText = getLabelText(input) || property;
const automationData = automationQueue.has(input)?
automationQueue.get(input)
: {input, labelText, host, property, text: "", function: null, enabled: false};
//console.debug("automation data: ", automationData);

app.prompt(`automation for ${labelText}`, automationData.text, text => {
//console.debug(`response: ${text}`);
if (text) {
const _function = compileFunction(text);

if (_function) {
//console.debug(`response: compiled to ${_function}`);
automationQueue.set(input,
Object.assign(automationData, {text, function: _function, enabled: true })
);

} else {
return false;
} // if
} // if

input.focus();
return true;
}); // prompt
} // defineAutomation

export function requestAutomation (data) {
automationRequests.push (data);
//console.debug("requestAutomation: ", data);
} // requestAutomation

function processAutomationRequests () {
console.log(`processing ${automationRequests.length} automation requests`);
try {
let request;
while (request = automationRequests.shift()) {
//console.debug("automation request: ", request);
const input = findUiControl(request.host, request.property);

if (input) {
request.function = compileFunction(request.text);
if (request.function) automationQueue.set (input,
Object.assign({}, request, {input: input}, {labelText: getLabelText(input), enabled: true})
); // set
else throw new Error(`${request.text}: cannot compile; aborting`);

} else {
throw new Error(`$bad automation specified for ${request.host._id}.${request.property}; skipped`);
} // if
} // while

} catch (e) {
console.error(e);
app.statusMessage(e);
} // catch
} // processAutomationRequests


export function requestKeyDefinition (definition) {
definitionRequests.push(definition);
} // requestKeyDefinition

function processKeyDefinitionRequests () {
console.log(`processing ${definitionRequests.length} definition requests`);
try {
let request;
while (request = definitionRequests.shift()) {
//console.debug("definition request: ", request);
const input = findUiControl(request.host, request.property);

if (input) {
keymap.defineKey(input, request.text);

} else {
throw new Error(`$bad shortcut definition specified for ${request.host._id}.${request.property}; skipped`);
} // if
} // while

} catch (e) {
console.error(e);
app.statusMessage(e);
} // catch
} // processKeyDefinitionRequests


export function findUiControl (host, property) {
const element = host.shadowRoot?.querySelector(`[data-name='${property}']`);
//console.debug(`uiControl: ${host._id}.${property}: ${element}`);
return element;
} // findUiControl

export function compileFunction (text, parameter = "t") {
try {
return new Function (parameter,
`with (Math) {
function  toRange (x, a,b) {return (Math.abs(a-b) * (x+1)/2) + a;}
function s (x, l=-1.0, u=1.0) {return toRange(Math.sin(x), l,u);}
function c (x, l=-1.0, u=1.0) {return toRange(Math.cos(x), l,u);}
function r(a=0, b=1) {return toRange(Math.random(), a, b);}
return ${text};
} // Math
`); // new Function

} catch (e) {
app.statusMessage(e);
return null;
} // try
} // compileFunction

export function setAutomationInterval (x) {automationInterval = x;}



export function parse (expression) {
if (!expression) return [];

let parser =
/^([\d.+\-]+)$|^(\w+)$|(\w+?)\{(.+?)\}/gi;
//console.debug("intermediate: ", [...expression.matchAll(parser)]);

const result = [...expression.matchAll(parser)]
.map(a => a.filter(x => x))
.map(a => a.slice(1));
//console.debug("parse: ", result);
return result;
} // parse

export function findAllUiElements () {
return Array.from(document.querySelectorAll("audio-context *"))
.map(x => Array.from(x.shadowRoot.querySelectorAll("input,select,button")))
.flat(9);
} // findAllUiElements

export function getLabelText (input) {
const groupLabel = input.closest("fieldset").querySelector("[role='heading']").textContent;
return (`${groupLabel} / ${input.parentElement.textContent}`).trim();
} // getLabelText

export function stringToList (s) {
const r = /, *?| +?/i;
return s.split(r);
} // stringToList


export function capitalize (s) {
return `${s[0].toUpperCase()}${s.slice(1)}`;
} // capitalize

export function separateWords (s) {
return capitalize(s.replace(/([A-Z])/g, " $1").toLowerCase().trim());
} // separateWords
