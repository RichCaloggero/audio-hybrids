import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as connector from "./connector.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";
import * as recorder from "./recorder.js";
import * as renderMode from "./renderMode.js";
import * as automation from "./automation.js";
import * as utils from "./utils.js";

export let root = null;
export let root0 = null;
let _prompt = "";
let _response = "";
let _responseCallback = null;
let _dialog = {open: false};


const suggestedAutomationIntervals = {
target: 0.75,
exponential: 0.75,
linear: 0.5,
instantaneous: 0.1,
input: 0.1,
host: 0.1
};

const defaults = {
hideOnBypass: {default: true},
enableAutomation: {default: false},
automationType: {default: "instantaneous", values: ["target", "exponential", "linear", "instantaneous", "host", "input"]},
automationInterval: {type: "number", default: suggestedAutomationIntervals["target"], min: 0.1, max: 1.0, step: 0.05},
};

const App = element.create("app", defaults, initialize, {
message: "",
statusMessage: () => statusMessage,

_focusPrompt: {
connect: (host, key) => host[key] = false,
observe: (host, value) => value && setTimeout(() => host.shadowRoot.querySelector("#prompt").focus(), 0)
}, // _focusPrompt

_focusDialog: {
connect: (host, key) => host[key] = false,
observe: (host, value) => value && setTimeout(() => host.shadowRoot.querySelector("#dialog .close").focus(), 0),
}, // _focusDialog


record: {
connect: (host, key) => host.key = false,
observe: (host, value) => {
if (audio.isRenderMode) return;
if (value) recorder.start();
else statusMessage("Recording disabled.");
} // observe
}, // record

renderAudio: {
connect: (host, key) => host.key = false,
observe: (host, value) => {
if (audio.isRenderMode) return;
const url = root.querySelector("audio-player").audioElement.src;
if (value) renderMode.loadAudio(url);
else statusMessage("Render mode disabled.");
} // observe
}, // renderAudio

hideOnBypass: {
connect: (host, key) => host[key] = true,
//observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

enableAutomation: {
connect: (host, key) => {
host[key] = ui.processAttribute(host, key, "enable-automation");
}, // connect
observe: (host, value) => {
if (audio.isRenderMode) return;
value? automation.enableAutomation() : automation.disableAutomation();
} // observe
}, // enableAutomation

automationInterval: {
connect: (host, key) => host[key] = Number(ui.processAttribute(host, key, "automation-interval")),
observe: (host, value) => automation.setAutomationInterval(Number(value))
}, // automationInterval

automationType: {
connect: (host, key) => host[key] = ui.processAttribute(host, key, "automation-type") || defaults.automationType,
observe: (host, value) => {
automation.setAutomationType(value);
host.automationInterval = suggestedAutomationIntervals[value] || host.automationInterval;
} // observe
}, // automationType


render: ({ label, message,  _focusPrompt, _focusDialog, record, renderAudio, hideOnBypass, enableAutomation, automationInterval, automationType }) => {
//console.debug(`${label}: rendering...`);

return html`
<fieldset class="app">
${ui.legend({ label })}
${ui.boolean({ label: "hide on bypass", name: "hideOnBypass", defaultValue: hideOnBypass })}

${ui.boolean({ label: "enable automation", name: "enableAutomation", defaultValue: enableAutomation })}
${ui.list("automation type", "automationType", automationType, defaults.automationType.values)}
${ui.number("automation interval", "automationInterval", automationInterval, 0.01, 0.3, 0.01)}

<div role="region" aria-label="status" aria-live="polite" id="status">
<!--${message}-->
</div>

${_focusPrompt && html`<div class="prompt" role="region" aria-label="prompt">
<label>${_prompt}:
<input type="text" id="prompt" defaultValue="${_response}"  oninput="${(host, event) => _response = event.target.value}"
onclick="${processResponse}" onkeydown="${handleKey}">
</label>
</div>
`}

${_focusDialog && html`<div id="dialog" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" style="position:relative;">
<div class="wrapper" style="position:absolute; left:0; top:0; width:100%; height:100%;">
<div class="head">
<h2 id="dialog-title" style="display:inline-block;">${_dialog.title}</h2>
<button class="close" aria-label="close" onclick="${(host, event) => {host._focusDialog = false; _dialog.returnFocus.focus()}}">X</button>
</div><div class="body">
<div id="dialog-description">${_dialog.description}</div>
<div class="content">${_dialog.content}</div>
</div><!-- .body -->
</div><!-- .wrapper -->
</div><!-- dialog -->
`}

${ui.boolean({label: "record", name: "record", defaultValue: record})}
${record && html`<div id="record-controls" role="region" aria-label="record">
<audio id="recorder-results" controls></audio>
</div>
`}

${ui.boolean({label: "Render audio", name: "renderAudio", defaultValue: renderAudio})}
${renderAudio && html`<div id="renderAudio-controls" role="region" aria-label="Render audio">
<audio id="render-results" controls tabindex="0"></audio>
</div>
`}

</fieldset>
<slot></slot>
`;
} // render
}); // app

define ("audio-app", App);


export function prompt (message, defaultResponse, callback) {
//console.debug(`prompt: ${message}, ${response}`);
if (message && callback && callback instanceof Function) {
_responseCallback = callback;
_prompt = message;
_response = defaultResponse;
root._focusPrompt = true;
} // if
} // prompt

function handleKey (host, event) {
if (event.key === "Enter" || event.key === "Escape") {
keymap.preventDefaultAction(event);
if (event.key === "Escape") _response = false;
processResponse(host);
} // if
} // handleKey

function processResponse (host) {
_responseCallback(_response);
setTimeout(() => host._focusPrompt = false, 0);
} // processResponse

export function displayDialog (dialog) {
_dialog = dialog;
root._focusDialog = true;
} // displayDialog

function initialize(host, key) {
host._load = {};
root = host;
// this keeps statusMessage() pointed at correct host even in render mode
if (!root0) root0 = host;

function loadHandler () {
if (host._load.audioGraphConnected && host._load.uiInitialized) {
host.dispatchEvent(new CustomEvent("loaded", {bubbles: true}));
console.log(`${host._id}: load complete`);
} // if
} // loadHandler

waitForUi(() => {
if (audio.isRenderMode) {
	renderMode.start(document);
console.debug("app.initialize: render mode...");

} else {
	ui.initialize();
keymap.initialize();
automation.initialize();
} // if
host._load.uiInitialized = true;
host.dispatchEvent(new CustomEvent("uiInitialized"));
console.debug(`${host._id} ui initialized.`);
loadHandler();
}); // waitForUi
//} // if

connector.waitForChildren(host, children => {
// calculate element depth to render correct heading levels in fieldset legends
root.querySelectorAll("*").forEach(host => host._depth = depth(host));

host._load.audioGraphConnected = true;
host.dispatchEvent(new CustomEvent("audioGraphConnected"));
console.log(`${host._id} graph connected.`);
loadHandler();
}); // wait for children
} // initialize

export function depth (start, _depth = 2) {
let e = start;
//console.debug(`depth: ${e._id} begin at  ${_depth}`);

while (e && e !== root) {
if (utils.isContainer(e.parentElement) && e.parentElement.getAttribute("label")) _depth += 1;
//console.debug(`depth: ${e._id}, ${e.parentElement.container}, ${e.parentElement.label} = ${_depth}`);
e = e.parentElement;
} // while

//console.debug(`${start._id}: depth = ${_depth}\ndone.\n`);
return _depth;
} // depth

export function statusMessage (text, append = true) {
const _status = root0?.shadowRoot?.querySelector("#status");
if (!_status) {
alert(text);
return;
} // if

const _message = document.createElement("p");
_message.textContent = text;

if (!append) _status.innerHTML = "";
_status.appendChild(_message);
} // statusMessage


function waitForUi (callback) {
// wait for all elements to have a shadowRoot, which means they are completely rendered in the dom
const app = root;
if (!app) {
throw new Error("renderReport: root is null or undefined");
} // if

// measure duration of process
const startTime = audio.context.currentTime;

// find all elements without a shadowRoot
let children = Array.from((app || root).querySelectorAll("*"))
.filter(child => !child.shadowRoot);

if (children.length === 0) {
runCallback(callback);
} else {
app.addEventListener("uiReady", uiReadyHandler);
} // if

function uiReadyHandler (e) {
const rendered = e.target;
children = children.filter(child => child !== rendered);
//console.debug(`uiReadyHandler: ${children.length} children`);
if (children.length === 0) {
runCallback(callback);

const all = Array.from(root.querySelectorAll("*"))
.map(element => [element._id, element.shadowRoot]);
const rendered = all.filter(e => e[1]);
const notRendered = all.filter(e => !e[1]);

console.log(`renderReport:\n
${all.length} elements found;\n
${rendered.length} rendered: ${rendered.map(e => e[0]).join(", ")};\n
${notRendered.length} not rendered: ${notRendered.map(e => e[0]).join(", ")};\n
time: ${(audio.context.currentTime - startTime).toFixed(2)} seconds;\n
End Report.`);
} // if
} // renderHandler


function runCallback (callback) {
if (callback && callback instanceof Function) callback();
} // runCallback
} // waitForUi

export function showRecordingControls () {
root.querySelector("audio-player").play = false;
displayDialog({
title: "Record",
description: "",
content: html`
<button class="start-recording" onclick="() => recorder.start();">Start Recording</button>
<button class="stop-recording" onclick="() => recorder.stop();">Stop Recording</button>
<audio class="recorder-results" controls></audio>
`, // html
returnFocus: root.shadowRoot.querySelector(".record")
}); // displayDialog
} // showRecordingControls 


