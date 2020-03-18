import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";

const defaults = {};

const Context = element.create("context", defaults, initialize, element.connect, {
message: "",


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
});

element.initializeHost(host);
} // if
} // initialize
