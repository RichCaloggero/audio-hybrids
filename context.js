import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

export let root = null;
const defaults = {};

const Context = element.create("context", defaults, initialize, element.connect, {
message: "",

hideOnBypass: {
connect: (host, key) => host[key] = host.hasAttribute("hide-on-bypass") || false,
observe: (host) => host.querySelectorAll("*").forEach(host => element.hideOnBypass(host))
}, // hideOnBypass

render: ({ label, message, hideOnBypass }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="context">
<legend><h1>${label}</h1></legend>
${ui.boolean("hide on bypass", "hideOnBypass", hideOnBypass)}

<div aria-live="polite" id="status">
${message}
</div>
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
element.initializeHost(host);
root = host;
host.dispatchEvent(new CustomEvent("complete", {bubbles: false}));
});

element.initializeHost(host);
} // if
} // initialize
