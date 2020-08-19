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
const aliases = new Map(definitions.filter(d => d instanceof Array));

const parameters = parameterMap(creator);
const data = dataMap(parameters);
// add common controls to our data map now
data.set("mix", {type: "number", min: -1, max: 1, default: 1});
data.set("bypass", {type: "boolean", default: false});


if (creator instanceof AudioNode) {
Object.assign(defaults, 
Object.assign(Object.fromEntries([...data.entries()]), commonDefaults(), defaults)
);
} // if

const descriptors = {};
descriptors._webaudioProp = (name) => aliases.get(name) || name;

Object.assign(descriptors,
commonProperties(name),
...createDescriptors(parameters, invertMap(aliases)),
...definitions.filter(d => !(d instanceof Array))
); // assign


if (!(creator instanceof Function)) descriptors.render = createRenderer(defaults);

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

function createRenderer (defaults) {
const keys = Object.entries(defaults).map(entry => entry[0]).filter(renderablePropertyName).filter(name => name !== "bypass" || name !== "mix");
console.debug(`createRenderer: keys ${keys}`);

return render((host) => {
const values = keys.map(k => ui.number(k, k, host[k]));

return html`
<fieldset class="${host.tagName.toLowerCase()}">
${ui.legend({ label: host.label, _depth: host._depth })}
${ui.commonControls({ bypass: host.bypass, mix: host.mix, defaults })}
<hr>
${values}
</fieldset>
`; // html
}); // render}); // callback
} // createRenderer


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
//if (host._id === "reverb1") debugger;

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
connect: (host, key) => host[key] = host.hasAttribute("bypass") || false,
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

function invertMap (m) {
return new Map(
[...m.entries()].map(e => [e[1], e[0]])
); // new Map
} // invertMap

function validPropertyName (name) {
return !invalidPropertyNames.includes(name);
} // validPropertyName

function renderablePropertyName (name) {
const unrenderable = ["hide", "silentBypass"];
return name[0] !== "_"
&& validPropertyName(name)
&& !unrenderable.includes(name);
} // renderableProperty


function renderTemplate (host) {
const keys = Object.keys(host).filter(renderablePropertyName);
//console.debug(keys, host);
const values = keys.map(k => html`
${ui.number(k, k, host[k])}
`);


return html`
<fieldset>
${ui.legend({ label: host.label, _depth: host._depth })}
${values}
</fieldset>
`;
} // renderTemplate

/*function renderTemplate () {
return (host) => {
console.debug(keys, host);
const values = keys.map(k => html`<p>${k}: ${host[k]}</p>`);

return html`
<fieldset>
<legend><h2>my-element</h2></legend>
${keys.map(k => html`<p>${k}: ${host[k]}</p>`)}
</fieldset>
`;
} // renderTemplate
*/
