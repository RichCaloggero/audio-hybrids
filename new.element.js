import {isDefined, getHostInfo, setHostInfo, initializeHost, isInitialized} from "./registry.js";
import * as ui from "./ui.js";
import {define, property, render, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as app from "./app.js";
import {parameterMap, dataMap} from "./parameterMap.js";
import * as utils from "./utils.js";

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
const parameters = parameterMap(creator) || new Map();
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
.filter(entry => ui.validPropertyName(entry[0])) // filter out invalid names like output, wet, dry, input, etc
), // assign
fixTypes(defaults)) // be sure our user supplied info is retained and add missing type info
); // assign
//} // if

// descriptors is what hybrids will see and convert to a custom element constructor

const descriptors = Object.assign({},
commonProperties(name),
...createDescriptors(parameters, invertMap(aliases)),
...definitions.filter(d => !(d instanceof Array)) // preserve user supplied property definitions (in addition or instead of those defined by audio nodes)
); // assign

descriptors._webaudioProp = () => (name) => aliases.get(name) || name; // this may be dropped; not sure if it is useful / necessary
descriptors._defaults = () => defaults; // link to defaults on actual element DOM node
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

//console.debug(`createDescriptor: ${webaudioProp}, ${uiProp}`);


return !ui.validPropertyName(uiProp)? null
: {[uiProp]: {
connect: connect,
observe: (host, value) => setParameter(host, host.node, webaudioProp, param, value)
} // descriptor
};

function setParameter (host, node, name, parameter, newValue) {
if (parameter instanceof AudioParam) {
node[name].value = Number(newValue);
//console.debug ("setParameter: ", host._id, name, parameter.value);

} else if (node && node[name]) {
node[name] = typeof(parameter) === "number"? Number(newValue) : String(newValue);
//console.debug ("setParameter: ", host._id, name, parameter);
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

