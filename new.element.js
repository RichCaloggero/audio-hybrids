import {define, property, render, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as app from "./app.js";
import * as ui from "./ui.js";
import * as keymap from "./keymap.js";
import {parameterMap, dataMap} from "./parameterMap.js";
import {isDefined, getHostInfo, setHostInfo, initializeHost, isInitialized} from "./registry.js";

const prefix = "audio";
const invalidPropertyNames = ["input", "output", "dry", "wet"];

/* creates a descriptor object which can be passed to hybrids define() to create a custom element
- name: element name (without prefix);
- defaults: default values;
- creator: a webaudio node or user supplied initialization function used to bootstrap the custom element;
- definitions (rest parameter): either user supplied descriptor objects or an alias array;
- alias array: array of pairs [ui parameter name , webaudio parameter name];
*/
export function create (name, defaults, creator, ...definitions) {
console.debug(`create(${name}):`);
const aliases = new Map(...definitions.filter(d => d instanceof Array));

// get parameters from node or audio worklet
const parameters = parameterMap(creator) || new Map;
// convert to our own data format
const data = dataMap(parameters);

// add common controls to our data map now
data.set("mix", {type: "number", min: -1, max: 1, default: 1});
data.set("bypass", {type: "boolean", default: false});


// convert to our own defaults object
// * consider using map instead, after all elements use this new element.create()
Object.assign(
defaults, // will be reflected in individual element source modules
Object.assign(Object.fromEntries(
[...fixData(data, invertMap(aliases)).entries()] // add type info
.filter(entry => validPropertyName(entry[0])) // filter out invalid names like output, wet, dry, input, etc
), // assign
fixTypes(defaults)) // be sure our user supplied info is retained and add missing type info
); // assign
//} // if

// descriptors is what hybrids will see and convert to a custom element constructor
const descriptors = {};
descriptors._webaudioProp = () => (name) => aliases.get(name) || name; // this may be dropped; not sure if it is useful / necessary
descriptors._defaults = () => defaults; // link to defaults on actual element DOM node

Object.assign(descriptors,
commonProperties(name),
...createDescriptors(parameters, invertMap(aliases)),
...definitions.filter(d => !(d instanceof Array)) // preserve user supplied property definitions (in addition or instead of those defined by audio nodes)
); // assign

// if we're wrapping an AudioNode, create the UI
// other elements such as our connectors need to build UI, if necessary, in their own modules 
if (!(creator instanceof Function)) descriptors.render = ui.createRenderer(defaults);

// this is used by connect() when an element is actually used and connected to the DOM
setHostInfo(name, { descriptors, creator, parameters, defaults,
idGen: idGen(name)
});

return descriptors;
} // create

function createDescriptors (parameters, invertedAliases) {
return [...parameters.entries()].map(createDescriptor).filter(d => d);

function createDescriptor (p) {
const webaudioProp = p[0];
const uiProp = invertedAliases.get(webaudioProp) || webaudioProp;
const param = p[1]; // either an AudioParam or a primitive string / number

console.debug(`createDescriptor: ${webaudioProp}, ${uiProp}`);


return !validPropertyName(uiProp)? null
: {[uiProp]: {
connect: connect,
observe: (host, value) => setParameter(host, host.node, webaudioProp, param, value)
} // descriptor
};

function setParameter (host, node, name, parameter, newValue) {
if (parameter instanceof AudioParam) parameter.value = Number(newValue);
else if (node && node[name]) node[name] = typeof(parameter) === "number"? Number(newValue) : String(newValue);
} // setParameter
} // createDescriptor
} // createDescriptors




export function alias(host, key) {
return (host._aliases && host._aliases.has(key))?
host.aliases.get(key) : key;
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


/// connection and attributes

export function connect (host, key) {
const creator = getHostInfo(host).creator;

if (!isInitialized(host)) {
host._id = getHostInfo(host).idGen.next().value;
console.debug(`${host._id}: connect(${key}) initializing...`, host);
audio.initialize(host);

if (creator instanceof Function) {
// custom element (most likely a connector like parallel or series)
creator(host);
initializeHost(host);

} else if (creator instanceof AudioNode) {
host.node = creator;
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
//console.debug(`element.connect: ${host._id}(${key}): setting value to ${value}`);
host[key] = value;
//if (key === "_connected") console.debug(`_connected: ${host._id}`);
} // connect

export function getDefault (host, key, defaults = {}) {
return processAttribute(host, key) || defaults[key]?.default;
} // getDefault


function commonProperties (name) {
if (!name) {
throw new Error(`commonProperties: name is null; aborting`);
} else if (isDefined(name)) {
throw new Error(`create: duplicate descriptors generated: ${getHostInfo(name)._id}; aborting`);
} // if
return {
_depth: 0,
_name: () => name,

_connected: property(true, connect),

// when this is called, then the shadowRoot is rendered, so dispatch our uiReady event for waitForUi to catch
_rendered: render(host => {
host.dispatchEvent(new CustomEvent("uiReady", {bubbles: true}));
console.debug(`commonProperties: ${host._id}: render complete`);
return () => {};
}), // _rendered

label: {
connect: (host, key) => host[key] = host.getAttribute(key) || "",
observe: (host, value) => {
if (host.shadowRoot?.querySelector("fieldset")) host.shadowRoot.querySelector("fieldset").hidden = !value
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
connect: (host, key) => host[key] = host.hasAttribute("bypass"),
/*observe: (host, value) => {
if (value) {
host.__bypass(true);
if (app.root?.hideOnBypass) hideOnBypass(host);

} else {
host.__bypass(false);
showAll(host);
processHide(host);
} // if
} // observe
*/
},  // bypass

silentBypass: {
connect: (host, key) => host[key] = host.hasAttribute("silent-bypass"),
//observe: (host, value) => host.__bypass(host.bypass)
}, // silentBypass

mix: {
connect: (host, key) => connect(host, key),
observe: (host, value) => host.__mix(value)
}, // mix
}; // properties
}// commonProperties

export function hideOnBypass (host) {
if (host.shadowRoot) {
Array.from(host.shadowRoot.querySelectorAll("fieldset > *"))
.slice(2).forEach(x => x.hidden = true);
if (host.shadowRoot.querySelector("slot")) host.shadowRoot.querySelector("slot").hidden = true;
} // if
} // hideOnBypass

export function showAll (host) {
if (host.shadowRoot) {
Array.from(host.shadowRoot.querySelectorAll("fieldset > [hidden=true]"))
.forEach(x => x.hidden = false);
if (host.shadowRoot.querySelector("slot")) host.shadowRoot.querySelector("slot").hidden = false;
} // if
} // showAll

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
const nodeProperty = host.node && host.aliases? host.aliases[property] : "";
return Object.assign({}, ...data.map(item => {
if (item.length === 1) {
return {default: item[0]};
} else {
const [operator, operand] = item;
if (operator === "automate" || operator === "-automate") {
return {automate: {host, property, nodeProperty, text: operand, enabled: operator[0] !== "-"}};
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
console.debug(`${element._id}: child ${e.target._id} is ready; ${children.length} remaining`);
if (children.length > 0) return;

// no more children left, so remove this handler and signal ready on this element
element.removeEventListener("elementReady", handleChildReady);

//setTimeout(() => {
runCallback(element, callback);
//}, 0);
} // handleChildReady

function runCallback (element, callback) {
console.debug(`${element._id}: all children ready; executing callback`);

try {
//callback(Array.from(element.children));
//setTimeout(() => {
callback.call(element, Array.from(element.children));
//}, 0);
signalReady(element);
} catch (e) {
console.error(`abort: ${e}\n${e.stack}\n`);
} // catch
} // runCallback

} // waitForChildren


export function signalReady (element) {
element.dispatchEvent(new CustomEvent("elementReady", {bubbles: true}));
element._isReady = true;
//console.debug (`${element._id} signaling ready`);
} // signalReady



export function isContainer (host) {
const containers = ["series", "parallel", "split"];
return containers.includes(host._name);
} // isContainer

function invertMap (m) {
return new Map(
[...m.entries()].map(e => [e[1], e[0]])
); // new Map
} // invertMap

export function validPropertyName (name) {
return !invalidPropertyNames.includes(name);
} // validPropertyName

export function renderablePropertyName (name) {
const unrenderable = ["hide", "silentBypass"];
return name[0] !== "_"
&& validPropertyName(name)
&& !unrenderable.includes(name);
} // renderableProperty


function fixData(data, invertedAliases) {
return new Map(
[...data.entries()].map(entry => {
const _name = invertedAliases.get(entry[0]) || entry[0];
const _data = entry[1];
console.debug("name: ", _name);

return [_name, _data];
}) // map
); // new Map
} // fixData

function fixTypes (obj) {
return Object.fromEntries(
Object.entries(obj).map(entry => {
const _data = entry[1];
if (_data.type === undefined) {
_data.type = _data.default === undefined? "string" : typeof(_data.default);
} // if
return entry;
}) // map
); // fromEntries
} // fixTypes
