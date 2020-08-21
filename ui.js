import {renderablePropertyName} from "./new.element.js";
import {render, html} from "./hybrids/index.js";
import * as app from "./app.js";
import * as audio from "./audio.js";
import * as keymap from "./keymap.js";

export let automator = null;
export let automationInterval = 0.03; // seconds
export let automationType = "linear";
const automationQueue = new Map();
const automationRequests = [];
const definitionRequests = [];

// to make with() work from function created via "new Function" , this needs to be global
window.automationData = Object.create(Math);
window.automationData.average = 0;
window.automationData.frameAverage = 0;
window.automationData.channelAverage = [0,0];


export function initialize (e) {
if (app.isRenderMode()) {
automator = null;
app.statusMessage("ui: render mode...");

} else {
processAutomationRequests();
processKeyDefinitionRequests();
app.root.addEventListener("keydown", keymap.globalKeyboardHandler);

audio.context.audioWorklet.addModule("automator.worklet.js")
.then(() => {
//alert ("starting parameter-automator");
automator = new AudioWorkletNode(audio.context, "parameter-automator");
//alert("automator node created");

automator.port.onmessage = e => {
if (app.root.enableAutomation) {
const message = e.data;
if (message instanceof Array) {
// envelope following code here -- make quantities available as variables which can be used by automation functions
Object.assign(window.automationData, Object.fromEntries(message));

} else if (message === "tick") {
// if we receive a tick message, process the queue
automationQueue.forEach(e => automate(e));
} // if
} // if enabled
}; // onMessage

setAutomationInterval(automationInterval);
app.root._automator = automator;
app.statusMessage("ui: automator initialized");
}).catch(error => app.statusMessage(error));
} // if not render mode

console.log("UI initialization complete.");
} // initialize

/// rendering

export function createRenderer (defaults, aliases) {
const keys = Object.entries(defaults).map(entry => entry[0]).filter(renderablePropertyName).filter(name => name !== "bypass" && name !== "mix");

return render((host) => {
const values = keys.map(k => renderControl(k, host[k], defaults));

return html`
<fieldset class="${host.tagName.toLowerCase()}">
${legend({ label: host.label, _depth: host._depth })}
${commonControls({ bypass: host.bypass, mix: host.mix, defaults })}
<hr>
${values}
</fieldset>
`; // html
}); // render}); // callback
} // createRenderer

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

export function renderControl (name, value, data) {
console.debug(`renderControl: ${name}, ${value}, `, data);

const control = { name, label: separateWords(name), defaultValue: value || data[name].default };
switch (data[name].type) {
case "boolean": return boolean(control);
case "string": return text(control);
case "number": return number(control.label, control.name, control.defaultValue, data);
case "list": return list(control.label, control.name, control.defaultValue, data[name].values);
default: throw new Error(`renderControl: unknown type: ${name}, ${value}, `, data);
} // switch
} // renderControl


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

if (!step && min !== undefined && max !== undefined) step = (max - min) / 100;

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
if (!automator) {
if (!app.isRenderMode()) app.statusMessage(`enableAutomation: automator worklet not started; aborting`);
return;
} // if

automator.port.postMessage(["enable", true]);
app.statusMessage(`Automation of ${countEnabledAutomationItems ()} items enabled; queue size is ${automationQueue.size} .`);
} // enableAutomation

export function disableAutomation () {
if (!automator) {
if (!app.isRenderMode()) app.statusMessage(`disableAutomation: automator worklet not started; aborting`);
return;
} // if

automator.port.postMessage(["enable", false]);
app.statusMessage("Automation disabled.");
} // disableAutomation

/*export function enableAutomation () {
automator = setTimeout(function _tick () {
automationQueue.forEach(e => automate(e));
if (automator) setTimeout(_tick, 1000*automationInterval);
}, 1000*automationInterval); // startAutomation

app.statusMessage(`Automation of ${automationQueue.size} elements enabled.`);
} // enableAutomation
*/

/*export function disableAutomation () {
if (automator) {
clearTimeout(automator);
automator = null;
} // if

app.statusMessage("Automation disabled.");
} // disableAutomation
*/

function countEnabledAutomationItems () {
return Array.from(automationQueue.values())
.filter(x => x.enabled)
.length;
 } // countEnabledAutomationItems 

function automate (e) {
if (e.enabled) {
//console.debug(`automate ${e.host._id}.${e.property} = ${e.function(audio.context.currentTime)}`);
switch (automationType) {
case "host": //e.host[e.property] = e.function(audio.context.currentTime);
break;

case "input":
e.input.value = Number(e.function(audio.context.currentTime));
e.input.dispatchEvent(new CustomEvent("change", {bubbles: false}));
break;

default: automateAudioParam(e.host, e.property, e.function(audio.context.currentTime), audio.context.currentTime);
} // switch
} // if
} // automate

function automateAudioParam (host, property, value, t) {
let node = host.node;
if (host._name === "series") {
if (property === "delay") node = host._delay;
else if (property === "gain") node = host._gain;
} // if
//console.debug(`automateProperty: node = ${node}`);
 
if (node) {
if (host.aliases && host.aliases[property]) property = host.aliases[property];
else if (property === "delay") property = "delayTime";

if (node[property]) {
if (node[property] instanceof AudioParam) setAudioParam(node[property], value, t);
else node[property] = value;

} else {
throw new Error(`automateProperty: ${node} has no property ${property}; aborting`);
} // if

} else {
console.error(`automateProperty: no AudioParam; falling back to host automation`);
automationType = "host";
} // if

function setAudioParam (param, value, t) {
//console.debug(`setAudioParam: ${automationType}, ${param}, ${value.toFixed(5)}, ${t.toFixed(3)}`);
switch (automationType) {
case "instantaneous": param.setValueAtTime(value, t); break;
case "linear": param.linearRampToValueAtTime(value, t+automationInterval); break;
case "exponential": param.exponentialRampToValueAtTime(value, t+automationInterval); break;
case "target": param.setTargetAtTime(value, t, automationInterval); break;
default: break;
} // switch

//console.debug(`setAudioParam: value = ${param.value}`);
return;
} // setAudioparam
} // automateAudioParam

export function isAutomationEnabled (input) {
if (automationQueue.has(input)) {
return automationQueue.get(input).enabled;
} // if
} // isAutomationEnabled

export function scheduleAutomation (duration, elementMap) {
if (app.isRenderMode()) {
const timeStepCount = duration / automationInterval;
const itemCount = automationQueue.size;
const items = transformAutomationItems(automationQueue, elementMap);
console.debug(`scheduleAutomation: duration = ${duration.toFixed(2)}, itemCount = ${itemCount}, interval = ${automationInterval.toFixed(3)}, timeStepCount = ${Math.floor(timeStepCount)}`);

try {
let count = 0;

items.forEach(item => {
count += 1;
const value = item.function(0);
//showAutomationItem(item, 0);

item.audioParam.setValueAtTime(value, 0);
}); // forEach item

for (let t = automationInterval; t < duration; t += automationInterval) {
items.forEach(item => {
count += 1;
const value = item.function(t);

//if (count <= 20) showAutomationItem(item, t);

item.audioParam.exponentialRampToValueAtTime(value, t);
}); // forEach item
} // for duration
} catch (e) {
console.error(e);
app.statusMessage(e);
} // try

console.debug("scheduleAutomation: complete");

function showAutomationItem (item, t) {
console.debug(`scheduleAutomation: automationItem: ${item.host._id}.${item.property} = ${item.function(t).toFixed(4)} {${item.text}}`);
} // displayAutomationItem
} // if


function transformAutomationItems (automationQueue, elementMap) {
const items = [];

automationQueue.forEach(e => {
if (e.enabled) {
const host = elementMap.get(e.host);
if (!host) throw new Error(`transformAutomationItems: cannot find new host corresponding to ${e.host._id}`);
let node = host.node;

// special case audio-series
if (host.matches("audio-series")) {
if (e.property === "delay") {
node = host._delay;
e.nodeProperty = "delayTime";
} else if (e.property === "gain") {
node = host._gain;
e.nodeProperty = "gain";
} // if
} // if

const property = e.nodeProperty;
const audioParam = node[property];
if (node && audioParam) {
items.push({
property, node, audioParam, host,
function: e.function,
text: e.text
}); // push
} // if
} // if enabled
}); // forEach

return items;
} // transformAutomationItems
} // scheduleAutomation

export function toggleAutomation (input) {
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
Object.assign(automationData, {text, function: _function})
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
processRequests(automationRequests, request => {
try {
console.debug("automation request: ", request);
const input = findUiControl(request.host, request.property);

if (input) {
request.function = compileFunction(request.text);
if (request.function) {
automationQueue.set (input,
Object.assign({}, request, {input: input}, {labelText: getLabelText(input), enabled: request.enabled || false})
); // set
} else {
throw new Error(`${request.text}: cannot compile; aborting`);
} // if

} else {
throw new Error(`bad automation specified for ${request.host._id}. ${request.property}; skipped`);
} // if

} catch (e) {
console.error(`${e.message} at ${e.lineNumber}`);
app.statusMessage(e.message);
} // catch
}); // processRequest
} // processAutomationRequests


export function requestKeyDefinition (definition) {
//console.debug(`requestDefinition: ${definition.host._id}, ${definition.property}, ${definition.text}`);
definitionRequests.push(definition);
} // requestKeyDefinition

function processKeyDefinitionRequests () {
console.log(`processDefinitionRequests: processing ${definitionRequests.length} definition requests`);
processRequests (definitionRequests, request => {
try {
//console.debug("definition request: ", request);
const input = findUiControl(request.host, request.property);

if (input) {
keymap.defineKey(input, request.text);

} else {
throw new Error(`bad shortcut definition specified for ${request.host._id}. ${request.property}; skipped`);
} // if

} catch (e) {
console.error(`${e.message} at ${e.lineNumber}`);
app.statusMessage(e.message);
} // catch
}); // processRequest
} // processKeyDefinitionRequests


function processRequests (queue, callback) {
let request;
while (request = queue.shift()) {
callback(request);
} // while
} // processRequest

export function findUiControl (host, property) {
const element = host.shadowRoot?.querySelector(`[data-name='${property}']`);
//console.debug(`findUiControl: ${host._id}.${property}: ${element}`);
return element;
} // findUiControl

export function compileFunction (text, parameter = "t") {
try {
return new Function (parameter,
`with (automationData) {
function  scale (x, in1,in2, out1,out2) {
in1 = Math.min(in1,in2);
in2 = Math.max(in1,in2);
out1 = Math.min(out1,out2);
out2 = Math.max(out1,out2);
const f = Math.abs(out1-out2) / Math.abs(in1-in2);

return f* Math.abs(x-in1) + out1;
} // scale

function s (x, l=-1.0, u=1.0) {return scale(Math.sin(x), -1,1, l,u);}
function c (x, l=-1.0, u=1.0) {return scale(Math.cos(x), -1,1, l,u);}
function r(a=0, b=1) {return scale(Math.random(), 0,1, a,b);}

return ${text};
} // Math
`); // new Function

} catch (e) {
app.statusMessage(e);
return null;
} // try
} // compileFunction

export function setAutomationInterval (x) {
automationInterval = x;
if (automator && !app.isRenderMode()) automator.port.postMessage(["automationInterval", automationInterval]);
} // setAutomationInterval

export function setAutomationType (value) {
automationType= value;
} // setAutomationType 


export function parse (expression) {
if (!expression) return [];

let parser =
/^([-+]?[\d.]+)$|^([-\w]+)$|([-\w]+?)\{(.+?)\}/gi;
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
return s.split(r).filter(s => s.length > 0);
} // stringToList


export function capitalize (s) {
return `${s[0].toUpperCase()}${s.slice(1)}`;
} // capitalize

export function separateWords (s) {
return capitalize(s.replace(/([A-Z])/g, " $1").toLowerCase().trim());
} // separateWords
