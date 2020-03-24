import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

export let root = null;
const defaults = {};

const Context = element.create("context", defaults, initialize, element.connect, {
message: "",
responseCallback: undefined,
//response: "",

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
}, // hideOnBypass

automationInterval: {
connect: (host, key) => host[key] = Number(host.getAttribute("automation-interval")) || ui.automationInterval,
observe: (host, value) => ui.setAutomationInterval(Number(value))
}, // automationInterval


render: ({ label, message, prompt, response, hideOnBypass, enableAutomation, automationInterval }) => {
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

<div class="prompt" role="region" aria-label="">
${prompt && html`<label>automation for ${prompt}:
<input type="text" id="prompt" value="${response}" oninput="${html.set("response")}" onkeyup="${(host, event) => {
if (event.key === "Enter" || event.key === "Escape") {
if (event.key === "Escape") host.response = "";
if (host.responseCallback(host.response)){
host.prompt = "";
host.response = "";
host.responseCallback = null;
} else {
host.response = "";
} // if
} // if
}}">
</label>
`}
</div>

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

function initialize(host, key) {
if (!element.isInitialized(host)) {
element.waitForChildren(host, children => {
console.log(`${host._id} is complete`);
root = host;
//debugger;
// calculate element depth to render correct heading levels in fieldset legends
root.querySelectorAll("*").forEach(host => host._depth = depth(host));
//}, 0);

// process collected automation requests specified in the markup (need to run asynch because shadowRoot not available yet)
setTimeout(() => ui.processAutomationRequests(), 0);

host.dispatchEvent(new CustomEvent("complete", {bubbles: false}));
});

} // if
} // initialize

export function depth (start, _depth = 2) {
let e = start;
//console.debug(`depth: ${e._id} begin at  ${_depth}`);

while (e && e !== root) {
if (e.parentElement.container && e.parentElement.label) _depth += 1;
//console.debug(`depth: ${e._id}, ${e.parentElement.container}, ${e.parentElement.label} = ${_depth}`);
e = e.parentElement;
} // while

//console.debug(`${start._id}: depth = ${_depth}\ndone.\n`);
return _depth;

function isContainer (e) {return e.shadowRoot?.querySelector("slot");}
} // depth
