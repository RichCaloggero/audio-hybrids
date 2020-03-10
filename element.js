import {property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";


export function create (creator, ...definitions) {
return Object.assign(
commonProperties(),
{creator: () => creator},
{_connected: property(true, connect)},
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign


function createDescriptors (props) {
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
set: (host, value) => host.node[webaudioProp] instanceof AudioParam? host.node[webaudioProp].value = Number(value) : host.node[webaudioProp] = value,
connect: (host, key) => host[key] = getDefault(host, key),
}};
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
} // createAlias
} // createDescriptors

} // createAudioProcessor 


export function connect (host, key) {
if (!host._initialized) {
//console.debug(`${host.id}: connecting...`);
if (!host.creator) {
throw new Error(`${host.id}: no creator -- aborting`);
} // if

audio.initialize(host);
if (host.creator instanceof Function ) {
host.creator(host);
} else if (host.creator in audio.context) {
host.node = audio.context[host.creator].call(audio.context);
host.input.connect(host.node).connect(host.wet);

// defaults from the user will have their properties frozen, but the object can have new keys added
// if no user supplied defaults exist, then add an empty object first
if (!host.defaults) host.defaults = {};
Object.assign(host.defaults, defaults(), audioProcessor.getPropertyInfo(host, host.node), host.defaults);
//console.debug(`${host.id}: created defaults`);

} else {
alert(`${host.id}: bad creator -- ${host.creator}; aborting`);
throw new Error(`bad creator`);
} // if

//console.debug(`${host.id}: webaudio node connected - ${host.node}`);

signalReady(host);
	host._initialized = true;
} // if
} // connect

export function commonProperties () {
return {

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

