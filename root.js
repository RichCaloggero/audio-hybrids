import {html, define} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";

const elementName = "test-root";
let instanceCount = 0;
export const Root = {
id: `${elementName}-${++instanceCount}`,
message: "",
label: "",

render: ({ label, message }) => html`
<fieldset class="root">
<legend><h2>${label}</h2></legend>

<div aria-live="polite" id="status">
${message}
</div>
</fieldset>
<slot></slot>
</fieldset>
`, // render
}; // Root

define(elementName, Root);

export function statusMessage (text) {
Root.message = text;
} // statusMessage

/*export function waitForChildren (element, callback) {
let children = Array.from(element.children);


element.addEventListener("elementReady", handleChildReady);
//statusMessage (`${element.id}: waiting for ${children.length} children`);

function handleChildReady (e) {
if (!children.includes(e.target)) return;
//statusMessage(`${element.id}: child ${e.target.id} is ready`);

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);
//statusMessage(`${element.id}: all children ready`);

callback.call(element, element.children);
element.isReady = true;
} // handleChildReady
} // waitForChildren

export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
} // signalReady
*/
