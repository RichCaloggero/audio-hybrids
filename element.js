import {define, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";

const prefix = "audio";
const registry = new Map();
const instanceCount = Object.create(null);

export function create (name, defaults, creator, connect, ...definitions) {
if (!instanceCount[name]) instanceCount[name] = 0;
const _id = `${name}${++instanceCount[name]}`;

const descriptors = Object.assign(
commonProperties(_id),
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign


registry.set(_id, {
descriptors: descriptors,
creator: creator,
connect: connect,
defaults:  defaults
});
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
if (!host._id) {
console.error(`bad element: aborting;\n`, host);
throw new Error(`bad element`);
} // if
const _id = host._id;
if (!registry.has(_id)) {
console.error(`no registry info for ${_id}; aborting`);
throw new Error(`no registry info`);
} // if
const hostInfo = registry.get(_id);

if (!host._initialized) {
console.debug (`${host._id}: initializing...`);
audio.initialize(host);

if (hostInfo.creator instanceof Function) {
hostInfo.creator(host);

}else if (typeof(hostInfo.creator) === "string" && hostInfo.creator in audio.context) {
host.node = audio.context[hostInfo.creator].call(audio.context);
host.input.connect(host.node).connect(host.wet);

const _defaults = Object.assign({}, commonDefaults(), hostInfo.defaults);
const info = audioProcessor.getPropertyInfo(host, host.node);
Object.keys(info).forEach(key => _defaults[key] = Object.assign({}, info[key], _defaults[key]));
Object.assign(hostInfo.defaults, _defaults);

} else {
throw new Error(`bad creator; aborting`);
} // if

host._initialized = true;
signalReady(host);
} // if

if (hostInfo.creator instanceof Function) {
hostInfo.creator(host, key);
return;
} // if

const _defaults = hostInfo.defaults;
console.debug(`${host._id}(${key}: connecting`);

let value = host.getAttribute(key)
|| _defaults[key]?.default;
value = Number(value)? Number(value) : value;
console.debug(`${host._id}(${key}): defaulted to ${value}`);
host[key] = value;
} // connect

export function commonProperties (_id) {
return {
_id: {get: () => _id},
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

