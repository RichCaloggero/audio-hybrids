import {html} from "./hybrids/index.js";
import * as context from "./context.js";
import * as audio from "./audio.js";

const savedValues = new Map();
let automator = null;
export let automationInterval = 0.03; // seconds
const automationQueue = new Map();
const automationRequests = [];



export function number (label, name, defaultValue, ...rest) {
//console.debug(`ui.number: ${name} default is ${defaultValue}`);
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

return html`<label>${label}: <input type="${type || 'number'}" defaultValue="${defaultValue}" onchange="${html.set(name)}" onkeyup="${handleSpecialKeys}"
min="${min}" max="${max}" step="${step}"
accesskey="${name[0]}"
data-name="${name}">
</label>`;


} // number

export function text (label, name, defaultValue) {
return html`<label>${label}: <input type="text" defaultValue="${defaultValue}" onchange="${html.set(name)}"></label>`;
} // text

export function boolean (label, name, defaultValue) {
return html`<label>${label}
${defaultValue? html`<input type="checkbox" checked onclick="${(host, event) => host[name] = event.target.checked}">`
: html`<input type="checkbox" onclick="${(host, event) => host[name] = event.target.checked}">`
}</label>`;
} // boolean

export function list(label, name, defaultValue, options) {
return html`<label>${label}: <select onchange="${html.set(name)}">${init(options, defaultValue)}</select></label>`;

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

export function commonControls (bypass, mix, defaults) {
return html`
${boolean("bypass", "bypass", false)}
${number("mix", "mix", mix, defaults.mix.min, defaults.mix.max, defaults.mix.step, defaults.mix.type)}
<br>
`; // return
} // commonControls


function handleSpecialKeys (host, event) {
const key = event.key;
const input = event.target;

if (input.type === "range" && handleRangeInput(key, input)) return false;
//if (isModifierKey(key)) return true;
//if (handleUserKey(e)) return false;

switch (key) {
case " ": {
if(event.ctrlKey && event.shiftKey) swapValues(input);
else if(event.ctrlKey) saveValue(input);
else return true;
} // case spaceBar
break;

case "Enter": {
//if (event.ctrlKey && event.altKey && event.shiftKey) //defineKey(getKey(input), input);
//else
if(event.ctrlKey) toggleAutomation(input);
else defineAutomation(input, input.getRootNode().host, input.getAttribute("data-name"));
} // case Enter
break

default: return true;
} // switch

return false;
} // handleSpecialKeys

function handleRangeInput(key, input) {
const [min, max, value] = [Number(input.min), Number(input.max), Number(input.value)];
switch (key) {
case "0": input.value = Number(0); return true;
case "1": input.value = Number(1); return true;
case "-": input.value = Number(-1 * value); return true;
case ".": if (checkRange(min, max)) input.value = Number((max-min)/2); return true;

default: return false;
} // switch

return false;
} // handleRangeInput

function checkRange (min, max) {
return Number(min) <= Number(max);
} // checkRange


function inRange (value, min = 0, max = 1) {
return typeof(min) === "number" && typeof(max) === "number" && typeof(value) === "number" && min <= value <= max;
} // inRange

export function saveValue (input) {
savedValues.set(input, input.value);
context.statusMessage(`${input.value}: value saved.`);
} // saveValue

export function swapValues (input) {
if (savedValues.has(input)) {
const old = savedValues.get(input);
savedValues.set(input, input.value);
input.value = old;
context.statusMessage(old);
} else {
context.statusMessage(`No saved value; press enter to save.`);
} // if
} // swapValues

export function enableAutomation () {
automator = setInterval(() => {
automationQueue.forEach(e => automate(e));
}, 1000*automationInterval); // startAutomation
} // startAutomation

export function disableAutomation () {clearInterval(automator); automator = null;}

function automate (e) {
if (e.enabled) {
e.host[e.property] = e.function(audio.context.currentTime);
//e.input.value = Number(e.function(audio.context.currentTime));
//console.debug(`automate ${e.host._id}.${e.property} = ${e.function(audio.context.currentTime)}`);
} // if
} // automate

function toggleAutomation (input) {
if (automationQueue.has(input)) {
const e = automationQueue.get(input);
e.enabled = !e.enabled;
automationQueue.set(input, e);
context.statusMessage(`${e.enabled? "enabled" : "disabled"} automation for ${e.property}`);
} // if
} // toggleAutomation

function defineAutomation (input, host, property) {
console.debug(`defining automation for ${host._id}.${property}:`);
const labelText = getLabelText(input);
const automationData = automationQueue.has(input)?
automationQueue.get(input)
: {input, labelText, host, property, text: "", function: null, enabled: false};
console.debug("automation data: ", automationData);

context.prompt(labelText, automationData.text, text => {
console.debug(`response: ${text}`);
if (text) {
const _function = compileFunction(text);

if (_function) {
console.debug(`response: compiled to ${_function}`);
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
console.debug("requestAutomation: ", data);
} // requestAutomation

export function processAutomationRequests () {
console.log(`processing ${automationRequests.length} automation requests`);
try {
automationRequests.forEach(request => {
console.debug("automation request: ", request);
const input = findUiControl(request.host, request.property);

if (input) {
request.function = compileFunction(request.text);
if (request.function) automationQueue.set (input, Object.assign({}, request, {labelText: getLabelText(input), enabled: true}));
else throw new Error(`${request.text}: cannot compile; aborting`);

} else {
throw new Error(`$bad automation specified for ${request.host._id}.${request.property}; skipped`);
} // if
}); // forEach

} catch (e) {
console.error(e);
context.statusMessage(e);
} // catch
} // processAutomationRequests

function findUiControl (host, property) {
const element = host.shadowRoot?.querySelector(`[data-name='${property}']`);
console.debug(`uiControl: ${host._id}.${property}: ${element}`);
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
context.statusMessage(e);
return null;
} // try
} // compileFunction

export function setAutomationInterval (x) {automationInterval = x;}



export function parse (expression) {
if (!expression) return [];

let parser =
/^(\d+)$|^(\w+)$|(\w+)\{(.+?)\}/gi;
//console.debug("intermediate: ", [...expression.matchAll(parser)]);

const result = [...expression.matchAll(parser)]
.map(a => a.filter(x => x))
.map(a => a.slice(1));
//console.debug("final: ", result);
return result;


} // parser

export function findAllUiElements () {
return Array.from(document.querySelectorAll("audio-context *"))
.map(x => Array.from(x.shadowRoot.querySelectorAll("input,select,button")))
.flat(9);
} // findAllUiElements

function getLabelText (input) {
return input.parentElement.textContent.trim();
} // getLabelText
