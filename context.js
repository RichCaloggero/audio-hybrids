import {html, define, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as connector from "./connector.js";

const Context = {
id: "context",
message: "",
label: "",


_connected: property(false, (host, key) => {
connector.waitForChildren(host, children => {
console.debug(`context is complete`);
});
}),

render: ({ label, message }) => html`
<fieldset class="context">
<legend><h1>${label}</h1></legend>

<div aria-live="polite" id="status">
${message}
</div>
</fieldset>
<slot></slot>
</fieldset>
`, // render
}; // Context

define("audio-context", Context);

export function statusMessage (text) {
Context.message = text;
} // statusMessage
