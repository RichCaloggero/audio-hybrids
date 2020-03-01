import {html, define, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";

const Context = {
id: "context",
message: "",
label: "",


_connected: property(false, (host, key) => {
waitForChildren(host, children => {
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

export function waitForChildren (element, callback) {
let children = Array.from(element.children);

element.addEventListener("elementReady", handleChildReady);
//statusMessage (`${element.id}: waiting for ${children.length} children`);
console.debug(`${element.id}: waiting for ${children.length} children`);

function handleChildReady (e) {
if (!children.includes(e.target)) return;

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
console.debug(`${element.id}: child ${e.target.id} is ready; ${children.length} remaining`);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);
//statusMessage(`${element.id}: all children ready`);

try {
callback.call(element, Array.from(element.children));
signalReady(element);
} catch (e) {
alert(`abort: ${e}`);
console.debug(`abort: ${e}\n${e.stack}\n`);
} // catch
} // handleChildReady
} // waitForChildren

export function isReady (element, value) {
if (value) {
signalReady(element);
alert(`${element.id} is ready`);
} // if
} // isReady

export function signalReady (element) {
//statusMessage(`${element.module.name}: sent ready signal`, "append");
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
console.debug (`${element.id} is ready`);
} // signalReady
