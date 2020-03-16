import {define, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";

const prefix = "audio";
const registry = Object.create(null);
const instanceCount = Object.create(null);

export function create (name, defaults, creator, _connect, ...definitions) {
if (!instanceCount[name]) instanceCount[name] = 0;
const _id = `${name}${++instanceCount[name]}`;
if (registry[_id]) {
throw new Error(`create: duplicate id generated: ${_id}; aborting`);
} // if
console.log(`creating ${_id}...`);


const descriptors = Object.assign(
commonProperties(_id),
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign

const _defaults = Object.assign({}, commonDefaults(), defaults);
if (typeof(creator) === "string" && creator in audio.context) {
const info = getPropertyInfo(audio.context[creator].call(audio.context), descriptors.aliases());
Object.keys(info).forEach(key => _defaults[key] = Object.assign({}, info[key], _defaults[key]));
} // if
Object.assign(defaults, _defaults);

registry[_id] = {
initialized: false,
descriptors: descriptors,
creator: creator,
connect: connect,
defaults:  defaults
};
return define (`${prefix}-${name}`, descriptors);
} // create

export function createDescriptors (props, _connect = connect) {
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
console.debug(`${host._id}.set (${webaudioProp}) = ${value}`);
return host.node[webaudioProp] instanceof AudioParam? host.node[webaudioProp].value = Number(value) : host.node[webaudioProp] = value
},
connect: _connect
}};
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
} // createAlias
} // createDescriptors


export function connect (host, key) {
const creator = getHostInfo(host).creator;
if (!isInitialized(host)) {
console.log(`${host._id}: initializing...`);
audio.initialize(host);

if (creator instanceof Function) {
creator(host);

}else if (typeof(creator) === "string" && creator in audio.context) {
host.node = audio.context[creator].call(audio.context);
host.input.connect(host.node).connect(host.wet);
initializeHost(host);
signalReady(host);

} else {
throw new Error(`bad creator; aborting`);
} // if

} else {
// we're initialized, so set defaults for key

if (creator instanceof Function) {
// creator will set initialized flag and set defaults
creator(host, key);
return;
} // if

const _defaults = getHostInfo(host).defaults;
console.debug(`${host._id}(${key}: connecting`);

let value = host.getAttribute(key)
|| _defaults[key]?.default;
value = Number(value)? Number(value) : value;
host[key] = value;
console.debug(`${host._id}(${key}): defaulted to ${value}`);
} // if
} // connect


function getHostInfo (host) {
const _id = host._id;
if (!_id) {
console.error(`bad element: aborting;\n`, host);
throw new Error(`bad element`);
} // if

if (registry[_id]) return registry[_id];

console.error(`no registry info for ${host._id}; aborting`);
throw new Error(`no registry info`);
} // getHostInfo

export function isInitialized (host) {
return registry[host._id]?.initialized;
} // isInitialized

export function initializeHost (host) {
registry[host._id].initialized = true;
console.log (`${host._id}: initialization complete`);
} // initializeHost


export function commonProperties (_id) {
return {
_id: () => _id,
label: "",

_connected: property(true, connect),

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
let children = Array.from(element.children)
.filter(child => !child._isReady);

if (children.length === 0) runCallback(element, callback);
else element.addEventListener("elementReady", handleChildReady);
console.log(`${element._id}: waiting for ${children.length} children`);

function handleChildReady (e) {
if (!children.includes(e.target)) return;

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
console.log(`${element._id}: child ${e.target._id} is ready; ${children.length} remaining`);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);

runCallback(element, callback);
} // handleChildReady

function runCallback (element, callback) {
console.log(`${element._id}: all children ready`);

try {
callback.call(element, Array.from(element.children));
console.debug(`${element._id}: callback returned`);
signalReady(element);
} catch (e) {
console.log(`abort: ${e}\n${e.stack}\n`);
} // catch
} // runCallback

} // waitForChildren


export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
element._isReady = true;
console.log (`${element._id} signaling ready`);
} // signalReady

function getPropertyInfo (node, _alias = []) {
const exclude = ["channelCount", "channelCountMode", "channelInterpretation", "numberOfInputs", "numberOfOutputs"];
const alias = invert(_alias);

return Object.assign({}, ...keys(node)
.filter(key => !exclude.includes(key))
.map(key => [key, node[key]])
.filter(p => typeof(p[1]) === "string" || typeof(p[1]) === "number" || p[1] instanceof AudioParam)
.map(p => {
const [key, value] = p;
const info = Object.create(null);
info[alias[key] || key] = value instanceof AudioParam?
{min: value.minValue, max: value.maxValue, default: value.defaultValue, step: 1}
: {default: value};
return info;
})); // map

function keys (node) {
const result = [];
	for (let key in node) result.push(key);
return result;
} // keys
} // getPropertyInfo

function invert (data) {
return Object.assign(Object.create(null),
...Object.keys(data)
.map(key => ({[data[key]]: key}))
); // assign
} // invert


export function alias(host, key) {
return (host.aliases && host.aliases[key])?
host.aliases[key] :  key;
} // alias
