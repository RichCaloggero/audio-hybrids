import {define, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
const environment = new Map();

export function create (creator, ...definitions) {
const result = Object.assign(
commonProperties(),
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign

environment.set(result, {
creator: creator,
defaults:  Object.assign({}, commonDefaults(), result.defaults)
});
return result;
} // create

export function createDescriptors (props, connect, defaults) {
const aliases = {};
const result = Object.assign({}, ...props.map(p => createDescriptor(p)));
result.aliases = () => aliases;
//console.debug(`adding aliases${result.aliases}`);

return result;

function createDescriptor (p) {
if (p instanceof Array) createAlias(p);
const webaudioProp = p instanceof Array? p[1] : p;
const prop = p instanceof Array? p[0] : p;
const key = prop;

//console.debug(`creating descriptor ${p}, ${prop}, ${webaudioProp}`);
return {[prop]: {
get: (host,value) => host.node[webaudioProp] instanceof AudioParam? host.node[webaudioProp].value : host.node[webaudioProp],
set: (host, value) => {
console.debug(`${host.id}.set (${webaudioProp}) = ${value}`);
return host.node[webaudioProp] instanceof AudioParam? host.node[webaudioProp].value = Number(value) : host.node[webaudioProp] = value
},
connect: connect
}};
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
} // createAlias
} // createDescriptors


function connect (host, key) {
if (!host._initialized) {
console.debug(`${host.id}: connecting...`);
if (!host.__creator) {
throw new Error(`${host.id}: no creator -- aborting`);
} // if

audio.initialize(host);
console.log(`${host.id}: `, host.__creator);
if (host.__creator instanceof Function ) {
console.debug(`${host.id}: creator function detected`);
host.__creator(host);
console.debug("- creator returned");

} else if (host.__creator in audio.context) {
console.debug(`${host.id}: audio processor being initialized`);
host.node = audio.context[host.creator].call(audio.context);
host.input.connect(host.node).connect(host.wet);
//host.defaults = Object.assign({}, audioProcessor.getPropertyInfo(host, host.node), host.defaults);
console.debug("- audio processor created");

} else {
alert(`${host.id}: bad creator -- ${host.__creator}; aborting`);
throw new Error(`bad creator`);
} // if

host._initialized = true;
} // if
} // connect

export function commonProperties () {
return {
label: "",

bypass: {
get: (host, value) => value,
	set: (host, value) => host.__bypass(value),
connect: (host, key) => false
},  // bypass

mix: {
get: (host, value) => host._mix,
	set: (host, value) => host.__mix(value),
connect: (host, key) => getDefault(host, key),
}, // mix
}; // properties
}// commonProperties

export function commonDefaults () {
return {
mix: {default: 1, min: -1, max: 1, step: 0.1, type: "range"},
};
} // commonDefaults

export function getDefault (host, key, _defaults) {
const defaults = Object.assign({}, _defaults, {default: host.getAttribute(key)});

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
console.log("- all children ready");

try {
callback.call(element, Array.from(element.children));
console.log("- callback returned");
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
console.log (`${element.id} signaling ready`);
} // signalReady

