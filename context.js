import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";

const Context = {
id: "context",
message: "",
label: "",

_connected: property(true, connect),

render: ({ label, message }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="context">
<legend><h1>${label}</h1></legend>

<div aria-live="polite" id="status">
${message}
</div>
</fieldset>
<slot></slot>
`;
} // render
}; // Context


define("audio-context", Context);

export function statusMessage (text) {
Context.message = text;
} // statusMessage

function connect (host, key) {
if (!host._initialized) {
element.waitForChildren(host, children => {
console.debug(`context is complete`);
element.signalReady(host);
});
host._initialized = true;
} // if
} // connect
