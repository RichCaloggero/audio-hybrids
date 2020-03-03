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


export function signalReady (element) {
//statusMessage(`${element.module.name}: sent ready signal`, "append");
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
console.debug (`${element.id} is ready`);
} // signalReady

export function connect (host, key) {
if (!host.node) {
	console.debug(`${host.id}: connecting...`);
if (!host.creator) {
throw new Error(`${host.id}: no creator -- aborting`);
} // if

if (host.creator instanceof Function ) host.node = host.creator(host);
else host.node = audio.context[host.creator].call(audio.context);

		audio.initialize(host);
host.input.connect(host.node).connect(host.wet);
host.defaults = getPropertyInfo(host, host.node);
console.debug("- defaults: ", host.defaults);
signalReady(host);
	} // if

	setDefault(host, key);
} // connect

function getPropertyInfo (host, node) {
console.debug(`getPropertyInfo: ${params(node)}`);
const defaults = {};
params(node).forEach (key => {
const p = node[key];
console.debug("- key: ", key, p, alias(host,key));
defaults[alias(host, key)] = p instanceof AudioParam?
{min: p.minValue, max: p.maxValue, default: p.defaultValue}
: {default: p};
});

return defaults;
} // getPropertyInfo

export function setDefault (host, key) {
if (host && key) {
if (host.hasAttribute(key)) return host.getAttribute(key);
	else if (host.defaults && host.defaults[key]) return host.defaults[key].default
} // if

return undefined;
} // setDefault


function alias(host, key) {
return (host.alias && host.alias[key])?
host.alias[key] :  key;
} // alias

export function descriptor (key) {
return {
get: (host, value) => host.node[alias(host, key)].value,
set: (host, value) => host.node[alias(host, key)].value = value,
connect: connect
}; // property descriptor
} // descriptor

function params (node) {
	return Object.keys(node)
.map(key => [key, node[key]])
.filter (x => x[1] instanceof AudioParam || typeof(x[1]) === "string")
.map(x => x[0]);
} // params


