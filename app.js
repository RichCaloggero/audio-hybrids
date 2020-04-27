import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";

export let root = null;
let _prompt = "";
let _response = "";
let _responseCallback = null;
let _dialog = {open: false};


const defaults = {};

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

hideOnBypass: {
connect: (host, key) => host[key] = true,
observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

enableAutomation: {
connect: (host, key) => host[key] = element.processAttribute(host, key, "enable-automation") || false,
observe: (host, value) => value? ui.enableAutomation() : ui.disableAutomation()
}, // enableAutomation

automationInterval: {
connect: (host, key) => host[key] = Number(element.processAttribute(host, key, "automation-interval")) || ui.automationInterval,
observe: (host, value) => ui.setAutomationInterval(Number(value))
}, // automationInterval


render: ({ label, message,  _focusPrompt, _focusDialog, hideOnBypass, enableAutomation, automationInterval }) => {
//console.debug(`${label}: rendering...`);

return html`
<fieldset class="app">
${ui.legend({ label })}
${ui.boolean({ label: "hide on bypass", name: "hideOnBypass", defaultValue: hideOnBypass })}
${ui.boolean({ label: "enable automation", name: "enableAutomation", defaultValue: enableAutomation })}
${ui.number("automation interval", "automationInterval", automationInterval, 0.01, 0.3, 0.01)}

<div aria-live="polite" aria-atomic="true" id="status">
${message}
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
root = host;
waitForUi(() => ui.initialize());

element.waitForChildren(host, children => {
// calculate element depth to render correct heading levels in fieldset legends
root.querySelectorAll("*").forEach(host => host._depth = depth(host));

//setTimeout(() => ui.initialize(), 20);

host.dispatchEvent(new CustomEvent("complete", {bubbles: false}));
console.log(`${host._id} is complete`);
}); // wait for children
} // initialize

export function depth (start, _depth = 2) {
let e = start;
//console.debug(`depth: ${e._id} begin at  ${_depth}`);

while (e && e !== root) {
if (element.isContainer(e.parentElement) && e.parentElement.getAttribute("label")) _depth += 1;
//console.debug(`depth: ${e._id}, ${e.parentElement.container}, ${e.parentElement.label} = ${_depth}`);
e = e.parentElement;
} // while

//console.debug(`${start._id}: depth = ${_depth}\ndone.\n`);
return _depth;
} // depth
export function statusMessage (text) {
(root || App).message = text;
setTimeout(() => (root || App).message = "", 3000);
} // statusMessage

function waitForUi (callback) {
const app = document.querySelector("audio-app");
if (app !== root) {
throw new Error("renderReport: app not equal to root");
} // if

const startTime = audio.context.currentTime;
let children = Array.from((app || root).querySelectorAll("*"))
.filter(child => !child.shadowRoot);

app.addEventListener("renderComplete", renderHandler);

function renderHandler (e) {
const rendered = e.target;
children = children.filter(child => child !== rendered);
if (children.length === 0) {
root.dispatchEvent(new CustomEvent("uiReady"));
if (callback && callback instanceof Function) callback();

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
} // waitForUi
