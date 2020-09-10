import * as app from "./app.js";
import * as audio from "./audio.js";
import * as utils from "./utils.js";

let automationEnabled = false;

const automationQueue = new Map();
let automationRequests = [];
const _automationTypes = {
exponential: {interval: 0.75,
apply (e, value, t) {
setAudioParam(e.host.node[e.nodeProperty], value, t, "exponentialRampToValueAtTime");
}},
linear: {interval: 0.5,
apply (e, value, t) {
setAudioParam(e.host.node[e.nodeProperty], value, t, "linearRampToValueAtTime");
}},
instantaneous: {interval: 0.1,
apply (e, value, t) {
setAudioParam(e.host.node[e.nodeProperty], value, t);
}},
target: {interval: 0.75,
apply (e, value, t) {
setAudioParam(e.host.node[e.nodeProperty], value, t, "setTargetAtTime");
}},
input: {interval: 0.1,
apply (e, value, t) {
const {input} = e;
input.value = Number(value);
input.dispatchEvent(new CustomEvent("change", {bubbles: false}));
}},
host: {interval: 0.1,
apply (e, value, t) {
e.host[e.property] = value;
}}
}; // _automationTypes




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
console.debug("processed automation queue");
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

automationQueue.forEach(cancelAutomation);
automator.port.postMessage(["enable", false]);

app.statusMessage("Automation disabled.");
} // disableAutomation

function cancelAutomation (item) {
//console.debug(item);
const param = item.nodeProperty;
if (param && param instanceof AudioParam) param.cancelScheduledValues(0);
} // cancelAutomation



function countEnabledAutomationItems () {
return Array.from(automationQueue.values())
.filter(x => x.enabled)
.length;
 } // countEnabledAutomationItems 

function automate (e) {
if (!e.enabled) return;
const t = audio.context.currentTime;
const value = e.function(t);
//console.debug(`automate ${host._id}.${e.property} = ${t}`);


_automationTypes[automationType] && _automationTypes[automationType].apply(e, value, t);
} // automate

function setAudioParam (audioParam, value, t, func) {
const arts = func === "setTargetAtTime"?
[value, t, automationInterval]
: [value, t];
try {
func? audioParam[func](...args)
: (audioParam.value = value);
} catch (e) {
console.error(`setAudioParam: ${e.message}`);
} // try
} // setAudioParam


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

export function automationTypes () {
return Object.keys(_automationTypes);
} // automationTypes

export function suggestedAutomationInterval (type) {
return type && _automationTypes[type] && _automationTypes[type].interval;
} // suggestedAutomationInterval

