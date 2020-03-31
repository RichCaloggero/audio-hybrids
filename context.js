import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";

export let root = null;
const defaults = {};

const Context = element.create("context", defaults, initialize, element.connect, {
message: "",
responseCallback: undefined,

prompt: {
connect: (host, key) => host[key] = "",
observe: (host, value) => value && setTimeout(() => host.shadowRoot.querySelector("#prompt").focus(), 0)
}, // prompt

hideOnBypass: {
connect: (host, key) => host[key] = true,
observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

enableAutomation: {
connect: (host, key) => host[key] = false,
observe: (host, value) => value? ui.enableAutomation() : ui.disableAutomation()
}, // enableAutomation

automationInterval: {
connect: (host, key) => host[key] = Number(host.getAttribute("automation-interval")) || ui.automationInterval,
observe: (host, value) => ui.setAutomationInterval(Number(value))
}, // automationInterval

dialog: {
connect: (host, key) => host.dialog= {open: false},
observe: (host, value) => value.open = true
}, // dialog

render: ({ label, message, prompt, response, dialog, hideOnBypass, enableAutomation, automationInterval }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="context">
<legend><h1>${label}</h1></legend>
${ui.boolean("hide on bypass", "hideOnBypass", true)}
${ui.boolean("enable automation", "enableAutomation", enableAutomation)}
${ui.number("automation interval", "automationInterval", automationInterval, 0.01, 0.3, 0.01)}

<div aria-live="polite" aria-atomic="true" id="status">
${message}
</div>

<div class="prompt" role="region" aria-label="prompt">
${prompt && html`<label>${prompt}:
<input type="text" id="prompt" value="${response}" oninput="${html.set("response")}" onkeyup="${processResponse}">
</label>
`}
</div>

${dialog.open && html`
<div role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description" style="position:relative;">
<div class="wrapper" style="position:absolute; left:0; top:0; width:100%; height:100%;">
<div class="head">
<h2 id="dialog-title" style="display:inline-block;">${dialog.title}</h2>
<button id="dialog-close" aria-label="close" onclick="${(host, target) => host.dialog.open = false}">X</button>
</div><div class="body">
<div id="dialog-description">${dialog.description}</div>
<div class="content">${dialog.content}</div>
</div><!-- .body -->
</div><!-- .wrapper -->
</div><!-- dialog -->
`}
</fieldset>
<slot></slot>
`;
} // render
}); // Context

define ("audio-context", Context);


export function statusMessage (text) {
//document.querySelector("audio-context").message = "";
document.querySelector("audio-context").message = text;
} // statusMessage


export function prompt (message, response, callback) {
//console.debug(`prompt: ${message}, ${response}`);
if (message && callback && callback instanceof Function) {
root.responseCallback = callback;
root.prompt = message;
root.response = response;
} // if
} // prompt

function processResponse (host, event) {
if (event.key === "Enter" || event.key === "Escape") {
if (event.key === "Escape") host.response = "";
host.responseCallback(host.response);
host.prompt = "";
host.response = "";
host.responseCallback = null;
} // if
} // processResponse

export function displayDialog (dialog) {
root.dialog = dialog;
} // displayDialog

function initialize(host, key) {
if (!element.isInitialized(host)) {
element.waitForChildren(host, children => {
console.log(`${host._id} is complete`);
root = host;
//debugger;
// calculate element depth to render correct heading levels in fieldset legends
root.querySelectorAll("*").forEach(host => host._depth = depth(host));
//}, 0);


host.dispatchEvent(new CustomEvent("complete", {bubbles: false}));
});

} // if
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
