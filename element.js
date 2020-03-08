import {property} from "./hybrids/index.js";

export function commonProperties () {
return {
id: "",
node: null,

label: {
connect: (host, key) => host[key] = getDefault(host, key),
observe: (host, value) => {
host.shadowRoot.querySelector("fieldset").hidden = value? false : true;
console.debug(`${host.id} label changed to ${value}`);
}, // observe
}, // label


bypass: {
get: (host, value) => value,
	set: (host, value) => host.__bypass(value),
connect: (host, key) => false
},  // bypass

mix: {
get: (host, value) => host._mix,
	set: (host, value) => host.__mix(value), // mix
connect: (host, key) => getDefault(host, key),
}, // mix
}; // properties
}// commonProperties

export function defaults () {
return {
mix: {default: 1, min: -1, max: 1, step: 0.1},
};
} // defaults

export function getDefault (host, key) {
console.debug(`getDefault: ${host.id}, ${key}`);
if (host && key) {
if (host.hasAttribute(key)) return host.getAttribute(key);
	else if (host.defaults && host.defaults[key]) return host.defaults[key].default
} // if

console.debug("- no defaults");
return undefined;
} // getDefault


export function waitForChildren (element, callback) {
let children = Array.from(element.children);

element.addEventListener("elementReady", handleChildReady);
//statusMessage (`${element.id}: waiting for ${children.length} children`);
console.log(`${element.id}: waiting for ${children.length} children`);

function handleChildReady (e) {
if (!children.includes(e.target)) return;

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
console.log(`${element.id}: child ${e.target.id} is ready; ${children.length} remaining`);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);
//statusMessage(`${element.id}: all children ready`);

try {
callback.call(element, Array.from(element.children));
signalReady(element);
} catch (e) {
alert(`abort: ${e}`);
console.log(`abort: ${e}\n${e.stack}\n`);
} // catch
} // handleChildReady
} // waitForChildren


export function signalReady (element) {
//statusMessage(`${element.module.name}: sent ready signal`, "append");
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
console.log (`${element.id} is ready`);
} // signalReady

