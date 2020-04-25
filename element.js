const registry = Object.create(null);

import {define, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as app from "./app.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";

const prefix = "audio";

export function create (name, defaults, creator, ...definitions) {
console.debug(`create(${name}):`);

const descriptors = Object.assign(
commonProperties(name),
...definitions.map(definition => definition instanceof Array? createDescriptors(definition) : definition)
); // assign

const _defaults = Object.assign({}, commonDefaults(), defaults);
if (typeof(creator) === "string" && creator in audio.context) {
const info = getPropertyInfo(audio.context[creator].call(audio.context), descriptors.aliases());
Object.keys(info).forEach(key => {
if (!Object.keys(_defaults).includes(key)) {
_defaults[key] = Object.assign({}, info[key], _defaults[key])
} // if
});
} // if
Object.assign(defaults, _defaults);

registry[name] = { descriptors, creator, defaults,
idGen: idGen(name)
};

return descriptors;
} // create

export function createDescriptors (props) {
const aliases = {};
const result = Object.assign({}, ...props.map(p => createDescriptor(p)));
result.aliases = () => aliases;
//console.debug(`adding aliases${result.aliases}`);
return result;

function createDescriptor (p) {
let webaudioProp;
let key;
if (p instanceof Array) {
createAlias(p);
key = p[0];
webaudioProp = p[1];
} else {
key = webaudioProp = p;
} // if

return {[key]: {
get: (host, value) => getWebaudioProp(host.node, webaudioProp),
set: (host, value) => setWebaudioProp(host.node, webaudioProp, value),
connect: connect,
} // descriptor
};

function getWebaudioProp (node, prop) {
return node[prop] instanceof AudioParam? node[prop].value : node[prop];
} // getWebaudioProp

function setWebaudioProp (node, prop, value) {
const parameter = node[prop];

if (parameter instanceof AudioParam) return setAudioParam(parameter, value);
else return setParam(node, prop, value);

function setAudioParam (audioParam, value) {
try {
return (audioParam.value = Number(value));
} catch (e) {
console.error("setAudioParam: ", prop, audioParam, value, `: ${e}`);
//debugger;
return audioParam.default;
} // try
} // setAudioParam

function setParam (node, prop, value) {
//console.debug(`setParam: ${node}, ${prop}, ${value}`);
if (Number(node[prop]) || node[prop] === 0)
return (node[prop] = Number(value));
else return (node[prop] = value);
} // setParam
} // setWebaudioProp
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
} // createAlias
} // createDescriptors


export function connect (host, key) {
const creator = getHostInfo(host).creator;

if (!isInitialized(host)) {
host._id = getHostInfo(host).idGen.next().value;
console.log(`${host._id}: initializing...`);
audio.initialize(host);

if (creator instanceof Function) {
creator(host);
initializeHost(host);

}else if (typeof(creator) === "string" && creator in audio.context) {
host.node = audio.context[creator].call(audio.context);
host.input.connect(host.node).connect(host.wet);
initializeHost(host);
signalReady(host);

} else {
throw new Error(`bad creator; aborting`);
} // if
} // if

// we're initialized, so set defaults for key
if (creator instanceof Function && key !== "mix") {
// all elements have mix control, so handle it here
return;
} // if

const _defaults = getHostInfo(host)?.defaults;
//console.debug(`defaults for ${host._id}: `, _defaults);

let value = getDefault(host, key, _defaults);
// NaN (not-a-number) tests falsey
console.debug(`element.connect: ${host._id}(${key}): setting value to ${value}`);
host[key] = value;
} // connect

export function getDefault (host, key, defaults = {}) {
return processAttribute(host, key) || defaults[key]?.default;
} // getDefault


function getHostInfo (host) {
const name = host._name;
if (!name) {
console.error(`bad element: aborting;\n`, host);
throw new Error(`bad element`);
} // if

if (registry[name]) return registry[name];

console.error(`no registry info for ${name}; aborting`);
throw new Error(`no registry info`);
} // getHostInfo

export function isInitialized (host) {
return host._initialized;
} // isInitialized

export function initializeHost (host) {
host._initialized = true;
console.log (`${host._id}: initialization complete`);
} // initializeHost


function commonProperties (name) {
if (registry[name]) {
throw new Error(`create: duplicate descriptors generated: ${_id}; aborting`);
} // if

return {
_depth: 0,
_name: () => name,
_connected: property(true, connect),

label: {
connect: (host, key) => host[key] = host.getAttribute(key) || "",
observe: (host, value) => {
if (host.shadowRoot) host.shadowRoot.querySelector("fieldset").hidden = !value
}
},

hide: {
connect: (host, key) => {
host._hide = [];
host[key] = host.getAttribute(key) || "";
}, // connect
observe: (host, value) => {
host._hide = value? ui.stringToList(value) : [];
processHide(host);
} // observe
}, // hide

bypass: {
connect: (host, key) => host[key] = host.hasAttribute(key) || false,
observe: (host, value) => {
host.__bypass(value);
host.__silentBypass(host.silentBypass && value);
hideOnBypass(host, app.root?.hideOnBypass && value);
if (!value) processHide(host);
} // observe
},  // bypass

silentBypass: {
connect: (host, key) => host[key] = host.hasAttribute("silent-bypass"),
observe: (host, value) => host.__silentBypass(host.bypass && value)
}, // silentBypass

mix: {
connect: (host, key) => connect(host, key),
observe: (host, value) => host.__mix(value)
}, // mix
}; // properties
}// commonProperties

export function hideOnBypass (host, value) {
setTimeout(() => {
if (host.shadowRoot) {
Array.from(host.shadowRoot.querySelectorAll("fieldset > *"))
.slice(2).forEach(x => x.hidden =  value);
if (host.shadowRoot.querySelector("slot")) host.shadowRoot.querySelector("slot").hidden = value;
} // if
}, 0);
} // hideOnBypass

export function commonDefaults () {
return {
mix: {default: 1.0, min: -1.0, max: 1.0, step: 0.1},
};
} // commonDefaults



export function waitForChildren (element, callback) {
let children = Array.from(element.children)
.filter(child => !child._isReady);

if (children.length === 0) {
runCallback(element, callback);
} else {
element.addEventListener("elementReady", handleChildReady);
console.log(`${element._id}: waiting for ${children.length} children`);
} // if


function handleChildReady (e) {
if (!children.includes(e.target)) return;

// remove this child and we're done if no more children left to process
children = children.filter(x => x !== e.target);
console.log(`${element._id}: child ${e.target._id} is ready; ${children.length} remaining`);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);

//setTimeout(() => {
runCallback(element, callback);
//}, 0);
} // handleChildReady

function runCallback (element, callback) {
console.log(`${element._id}: all children ready; executing callback`);

try {
//callback(Array.from(element.children));
//setTimeout(() => {
callback.call(element, Array.from(element.children));
//}, 0);
signalReady(element);
} catch (e) {
console.log(`abort: ${e}\n${e.stack}\n`);
} // catch
} // runCallback

} // waitForChildren


export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
element._isReady = true;
//console.debug (`${element._id} signaling ready`);
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

function* idGen (name) {
const map = new Map();
while (true) {
if (!map.has(name)) map.set(name, 0);
const count = map.get(name) + 1;
map.set(name, count);
yield `${name}${count}`;
} // while
} // idGen

export function processAttribute (host, key, attribute) {
if (!attribute) attribute = key;
if (!host.hasAttribute(attribute)) return undefined;
const value = host.getAttribute(attribute);

// case boolean attribute, presence with empty string value means true
if (value === "") return true;


const data = getData(host, key, ui.parse(value));
//console.debug(`processAttribute: ${JSON.stringify(data)}`);

if (data.automate) ui.requestAutomation(data.automate);
if (data.shortcut) ui.requestKeyDefinition(data.shortcut);
if (data.default) {
if (data.default === "true") return true;
else if (data.default === "false") return false;
else return data.default;
} // if

return undefined;

function getData (host, property, data) {
return Object.assign({}, ...data.map(item => {
if (item.length === 1) {
return {default: item[0]};
} else {
const [operator, operand] = item;
if (operator === "automate" || operator === "-automate") {
return {automate: {host, property, text: operand, enabled: operator[0] !== "-"}};
} // if automate

if (operator === "shortcut"){
return {shortcut: {host, property, text: operand}};
} // if shortcut

if (operator === "default") {
return {default: operand};
} // if default
} // if
}) // map
); // assign
} // getData
} // processAttribute

function processHide (host) {
setTimeout(() => {
if (host._hide.length > 0 && host.shadowRoot) {
host.shadowRoot.querySelectorAll("button,input,select").forEach(x => {
if (x.dataset.name)
(x.parentElement instanceof HTMLLabelElement? x.parentElement : x)
.hidden = host._hide.includes(x.dataset.name);
}); // forEach
} // if
}, 0); // timeout
} // processHide

export function isContainer (host) {
const containers = ["series", "parallel", "split"];
return containers.includes(host._name);
} // isContainer


