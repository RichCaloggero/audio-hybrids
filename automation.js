import * as app from "./app.js";
import * as audio from "./audio.js";
import * as utils from "./utils.js";

let automationEnabled = false;

const automationQueue = new Map();
let automationRequests = [];

export let automator = null;
export let automationInterval = 0.03; // seconds
export let automationType = "linear";


// to make with() work from function created via "new Function" , this needs to be global
window.automationData = Object.create(Math);
window.automationData.average = 0;
window.automationData.frameAverage = 0;
window.automationData.channelAverage = [0,0];



export function initialize () {
processAutomationRequests();

audio.context.audioWorklet.addModule("automator.worklet.js")
.then(() => {
//alert ("starting parameter-automator");
automator = new AudioWorkletNode(audio.context, "parameter-automator");
//alert("automator node created");

automator.port.onmessage = e => {
if (!audio.isRenderMode && automationEnabled) {
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

if (app.root.enableAutomation) enableAutomation();
setAutomationInterval(automationInterval);
app.root._automator = automator;
app.statusMessage("ui: automator initialized");
}) // worklet initialized
.catch(error => app.statusMessage(error));
} // initialize
export function enableAutomation () {
automationEnabled = true;
if (audio.isRenderMode) return;
if (!automator) return;

automator.port.postMessage(["enable", true]);
app.statusMessage(`Automation of ${countEnabledAutomationItems ()} items enabled; queue size is ${automationQueue.size} .`);
} // enableAutomation

export function disableAutomation () {
automationEnabled = false;
if (audio.isRenderMode) return;
if (!automator) return;

automator.port.postMessage(["enable", false]);
app.statusMessage("Automation disabled.");
} // disableAutomation



function countEnabledAutomationItems () {
return Array.from(automationQueue.values())
.filter(x => x.enabled)
.length;
 } // countEnabledAutomationItems 

function automate (e) {
if (!e.enabled) return;
const t = audio.context.currentTime;
const value = e.function(t);
const host = e.host;
//console.debug(`automate ${host._id}.${e.property} = ${t}`);
switch (automationType) {
case "host": host[e.property] = value;
break;

case "input":
e.input.value = Number(value);
e.input.dispatchEvent(new CustomEvent("change", {bubbles: false}));
break;

default: automateAudioParam(host, e.property, value, t);
} // switch
} // automate

function automateAudioParam (host, property, value, t) {
let node = host.node;
if (host._name === "series") {
if (property === "delay") node = host._delay;
else if (property === "gain") node = host._gain;
} // if
//console.debug(`automateProperty: node = ${node}`);
 
if (node) {
property = host._webaudioProp? host._webaudioProp(property) : property;

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
} // automateAudioParam

function setAudioParam (param, value, t) {
switch (automationType) {
case "instantaneous": param.setValueAtTime(value, t); break;
case "linear": param.linearRampToValueAtTime(value, t); break;
case "exponential": param.exponentialRampToValueAtTime(value, t); break;
case "target": param.setTargetAtTime(value, t, automationInterval); break;
default: return;
} // switch

if (audio.isRenderMode) console.debug(`setAudioParam: ${automationType}, ${param}, ${value.toFixed(5)}, ${t.toFixed(3)}`);

return;
} // setAudioparam

export function isAutomationEnabled (input) {
if (!input) return automationEnabled;
if (automationQueue.has(input)) {
return automationQueue.get(input).enabled;
} else {
return false;
} // if
} // isAutomationEnabled

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
const labelText = utils.getLabelText(input) || property;
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
automationRequests.forEach(request => {
try {
//console.debug("automation request: ", request);
const input = utils.findUiControl(request.host, request.property);

if (input) {
request.function = compileFunction(request.text);
if (request.function) {
automationQueue.set (input,
Object.assign({}, request, {input: input}, {labelText: utils.getLabelText(input), enabled: request.enabled || false})
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

automationRequests = [];
} // processAutomationRequests


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

export function setAutomationInterval (value) {
automationInterval = value;
if (automator && !audio.isRenderMode) automator.port.postMessage(["automationInterval", automationInterval]);
//console.debug(`automationInterval: ${value}`);
} // setAutomationInterval

export function setAutomationType (value) {
automationType= value;
//console.debug(`automationType: ${value}`);
} // setAutomationType 

export function setAutomator (value) {
automator = value;
//console.debug(`automator: ${value}`);
} // setAutomator


export function getAutomationData () {
return [...automationQueue.entries()].map(e => e[1])
.filter(e => e.enabled)
.map(e => ({id: e.host._id, text: e.text, property: e.property}))
.map( e => {
//console.debug("pipeline: ", e);
//debugger;
return e;
})
.map(e => e); // pipeline
} // getAutomationData

