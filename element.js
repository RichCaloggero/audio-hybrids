import {isDefined, getHostInfo, setHostInfo, initializeHost, isInitialized} from "./registry.js";
import * as ui from "./ui.js";
import {define, property, render, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as app from "./app.js";
import {parameterMap, dataMap, addTypeInfo, invertMap} from "./data.js";
import * as utils from "./utils.js";
import * as connector from "./connector.js";

const prefix = "audio";

/* creates a descriptor object which can be passed to hybrids define() to create a custom element
- name: element name (without prefix);
- defaults: default values;
- creator: a webaudio node or user supplied initialization function used to bootstrap the custom element;
- definitions (rest parameter): either user supplied descriptor objects or an alias array;
- alias array: array of pairs [ui parameter name , webaudio parameter name];
*/
export function create (name, defaults, creator, ...definitions) {
//console.debug(`create(${name}):`);
const aliases = new Map(...definitions.filter(d => d instanceof Array));

// get parameters from node or audio worklet
const data = new Map(
(creator instanceof AudioNode? [...dataMap(parameterMap(creator)).entries()] : [])
.map(aliasKeys(invertMap(aliases)))
.filter(entry => ui.validPropertyName(entry[0])) // filter out invalid names like output, wet, dry, input, etc
); // new Map

// add common controls to our data map now
if (!data.has("mix")) data.set("mix", {type: "number", min: -1, max: 1, default: 1});
if (!data.has("bypass")) data.set("bypass", {type: "boolean", default: false});

// merge with user supplied data
merge(data, defaults);


// convert to our own defaults object
// * consider using map instead, after all elements use this new element.create()
Object.assign(
defaults, // will be reflected in individual element source modules
Object.fromEntries(
[...data.entries()]
.map(e => {console.debug(e); return e;})
.map(e => [e[0], addTypeInfo(e[1])])
), // fromEntries
); // assign

// descriptors is what hybrids will see and convert to a custom element constructor
const descriptors = Object.assign({},
//defaults.createDescriptors instanceof Function? ...defaults.createDescriptors(defaults) :
createDescriptors(defaults),
commonProperties(name),
...definitions.filter(d => !(d instanceof Array)) // preserve user supplied property definitions (in addition or instead of those defined by audio nodes)
); // assign

descriptors._webaudioProp = () => (name) => aliases.get(name) || name;
descriptors._defaults = () => defaults;

// if we're wrapping an AudioNode, create the UI
// other elements such as our connectors need to build UI, if necessary, in their own modules 
if (!(creator instanceof Function)) descriptors.render = ui.createRenderer(defaults);

// this is used by connect() when an element is actually used and connected to the DOM
setHostInfo(name, { descriptors, defaults,
creator: creator instanceof AudioWorkletNode? "audioWorkletNode" : creator,
idGen: idGen(name)
});

return descriptors;
} // create

function createDescriptors (data, invertedAliases) {
const descriptors = Object.entries(data).map(createDescriptor).filter(d => d);
//console.debug("createDescriptors: ", descriptors);
return Object.fromEntries(descriptors);


function createDescriptor (p) {
const uiProp = p[0];
const data = p[1];

return !ui.validPropertyName(uiProp)? null
: [uiProp, {
connect: connect,
observe: (host, value) => {
setParameter(host, host.node, host._webaudioProp(uiProp), value, data);
} // observe
} // descriptor
]; // pair

function setParameter (host, node, name, newValue, data) {
if (!host || !node || !name)  throw new Error("setParameter: bad arguments");
const type = data.type;

if (data.audioParam) {
const audioParam = host.node instanceof AudioWorkletNode? host.node.parameters.get(name)
: host.node[name];
audioParam.setValueAtTime(Number(newValue), audio.context.currentTime);
//console.debug ("setParameter: ", host._id, name, parameter.value);

} else  {
if (node[name] instanceof AudioParam) node[name].setValueAtTime(Number(newValue), audio.context.currentTime);
else if (type === "number") node[name] = Number(newValue);
else if (type === "string") node[name] = String(newValue);
else if(type === "boolean") node[name] = Boolean(newValue);
else throw new Error(`setParameter: invalid type ${type} for ${host._id}.node.${name}`);
//console.debug ("setParameter: ", host._id, name, node[name]);
} // if
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

//console.debug(`commonProperties: ${host._id}: render complete`);
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
host._hide = value? utils.stringToList(value) : [];
processHide(host);
} // observe
}, // hide

bypass: {
connect: (host, key) => host[key] = host.hasAttribute("bypass"),
observe: (host, value) => {
if (value) {
host.__bypass(true);
if (app.root?.hideOnBypass) {
hideOnBypass(host);
} // if

} else {
host.__bypass(false);
showAll(host);
processHide(host);
} // if
} // observe
},  // bypass

silentBypass: {
connect: (host, key) => host[key] = host.hasAttribute("silent-bypass"),
}, // silentBypass

mix: {
connect: (host, key) => connect(host, key),
observe: (host, value) => host.__mix(value)
}, // mix
}; // properties
}// commonProperties


/// connection and attributes

export function connect (host, key) {
const creator = getHostInfo(host).creator;

if (!isInitialized(host)) {
host._id = getHostInfo(host).idGen.next().value;
host.id = host._id;
//console.debug(`${host._id}: connect(${key}) initializing...`);
audio.initialize(host);

if (creator instanceof Function) {
// custom element (most likely a connector like parallel or series)
creator(host);
initializeHost(host);

} else if (creator instanceof AudioNode) {
host.node = new creator.constructor(audio.context);
host.input.connect(host.node).connect(host.wet);
initializeHost(host);
connector.signalReady(host);

} else if (creator === "audioWorkletNode") {
host.node = new AudioWorkletNode(audio.context, host._name, {outputChannelCount: [2]});
host.input.connect(host.node).connect(host.wet);
initializeHost(host);
connector.signalReady(host);

} else {
throw new Error(`bad creator; aborting`);
} // if
} // if

// we're initialized, so set defaults for key
if (creator instanceof Function && key !== "mix") {
// all elements have mix control, so handle it here
return;
} // if


let value = getDefault(host, key, host._defaults[key]);
host[key] = value;
} // connect

export function getDefault (host, key, data = {}) {
const value = ui.processAttribute(host, key) || data.default;
if (!data.type) return value;
if (data.type === "number") return Number(value);
if (data.type === "boolean") return Boolean(value);
else return value;
} // getDefault



export function hideOnBypass (host) {
const elements = [...host.shadowRoot?.querySelectorAll("fieldset > *")].slice(2);
elements.forEach(x => x.hidden = true);
if (host.shadowRoot?.querySelector("slot")) host.shadowRoot.querySelector("slot").hidden = true;
} // hideOnBypass

export function showAll (host) {
[...host.shadowRoot?.querySelectorAll("fieldset > [hidden]")]
.forEach(x => x.hidden = false);
if (host.shadowRoot.querySelector("slot")) host.shadowRoot.querySelector("slot").hidden = false;
} // showAll

function processHide (host) {
//setTimeout(() => {
if (host._hide.length > 0 && host.shadowRoot) {
host.shadowRoot.querySelectorAll("button,input,select").forEach(x => {
if (x.dataset.name)
(x.parentElement instanceof HTMLLabelElement? x.parentElement : x)
.hidden = host._hide.includes(x.dataset.name);
}); // forEach
} // if
//}, 0); // timeout
} // processHide

function aliasKeys (aliasMap, pair) {
return function (pair) {
const [key, value] = pair;
return [
aliasMap.has(key)? aliasMap.get(key) : key,
value
];
}; // return function
} // aliasKeys

function merge (parameterMap, userData) {
Object.keys(userData).forEach(key => 
parameterMap.has(key)?
parameterMap.set(key, Object.assign({}, parameterMap.get(key), userData[key]))
: parameterMap.set(key, userData[key])
); // forEach key
} // merge
