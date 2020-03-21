import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

export let root = null;
const defaults = {};

const Context = element.create("context", defaults, initialize, element.connect, {
message: "",

hideOnBypass: {
connect: (host, key) => host[key] = true, // connect
observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

render: ({ label, message, hideOnBypass }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="context">
<legend><h1>${label}</h1></legend>

<div aria-live="polite" id="status">
${message}
</div>

${ui.boolean("hide on bypass", "hideOnBypass", true)}
</fieldset>
<slot></slot>
`;
} // render
}); // Context

define ("audio-context", Context);


export function statusMessage (text) {
document.querySelector("audio-context").message = text;
} // statusMessage

function initialize(host, key) {
if (!element.isInitialized(host)) {
element.waitForChildren(host, children => {
console.log(`${host._id} is complete`);
root = host;
//debugger;
//setTimeout(() => {
root.querySelectorAll("*").forEach(host => host._depth = depth(host));
//}, 0);
host.dispatchEvent(new CustomEvent("complete", {bubbles: false}));
});

} // if
} // initialize

export function depth (start, _depth = 2) {
let e = start;
console.debug(`depth: ${e._id} begin at  ${_depth}`);

while (e && e !== root) {
if (e.parentElement.container && e.parentElement.label) _depth += 1;
console.debug(`depth: ${e._id}, ${e.parentElement.container}, ${e.parentElement.label} = ${_depth}`);
e = e.parentElement;
} // while

console.debug(`${start._id}: depth = ${_depth}\ndone.\n`);
return _depth;

function isContainer (e) {return e.shadowRoot?.querySelector("slot");}
} // depth
