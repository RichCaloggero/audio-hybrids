import {property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";

export function create (...definitions) {
const result = Object.assign(
element.commonProperties(),
{_connected: property(true, connect)},
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign

//if (result.defaults) result.defaults = () => (result.defaults);
return result;

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
connect: (host, key) => host[key] = element.getDefault(host, key),
}};
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
} // createAlias
} // createDescriptors

} // createAudioProcessor 


export function connect (host, key) {
if (!host.node) {
	//console.debug(`${host.id}: connecting...`);
if (!host.creator) {
throw new Error(`${host.id}: no creator -- aborting`);
} // if

if (host.creator instanceof Function ) host.node = host.creator(host);
else host.node = audio.context[host.creator].call(audio.context);

audio.initialize(host);
host.input.connect(host.node).connect(host.wet);
//console.debug(`${host.id}: webaudio node connected - ${host.node}`);

// defaults from the user will have their properties frozen, but the object can have new keys added
// if no user supplied defaults exist, then add an empty object first
if (!host.defaults) host.defaults = {};
Object.assign(host.defaults, element.defaults(), getPropertyInfo(host, host.node), host.defaults);
//console.debug(`${host.id}: created defaults`);
element.signalReady(host);
	host._initialized = true;
} // if
} // connect



function getPropertyInfo (host, node) {
const alias = invert(host.aliases);
//console.debug(`inverted: `, alias);
const info = {};
params(node).forEach (key => {
const p = node[key];
info[alias[key] || key] = p instanceof AudioParam?
{min: p.minValue, max: p.maxValue, default: p.defaultValue, step: 1}
: {default: p};
});

return info;
} // getPropertyInfo

function invert (data) {
const result = {};
Object.keys(data)
.forEach (key => result[data[key]] = key);
return result;
} // invert


function alias(host, key) {
return (host.aliases && host.aliases[key])?
host.aliases[key] :  key;
} // alias

/*export function descriptor (key) {
return {
get: (host, value) => host.node[alias(host, key)].value,
set: (host, value) => host.node[alias(host, key)].value = value,
connect: connect
}; // property descriptor
} // descriptor
*/

function props(node) {
const result = [];
	for (let key in node) result.push([key, node[key]]);
return result;
} // props

function params (node) {
	return props(node)
	.filter(x =>
	x[1] instanceof AudioParam
	|| typeof(x[1]) === "number"
|| (typeof(x[1]) === "string" && !["channelInterpretation", "channelCountMode"].includes(x[0]))
	).map(x => x[0]);
} // params

export function create_noProps (definition) {
return Object.assign({
label: "",
id: "",
node: null,

bypass: {
get: (host, value) => value,
set: (host, value) => host.__bypass(value),
},

mix: {
get: (host, value) => value,
set: (host, value) => host.__mix(value),
},
}, // common properties
definition); // assign
} // create_noProps 

function pairsToObject (pairs) {
const result = {};
pairs.forEach(p => result[p[0]] = p[1]);
return result;
} // pairsToObject

export function audioParam (key) {
return {
get: (host, value) => host.node[alias(host,key)].value,
set: (host, value) => host.node[alias(host,key)].value = Number(value),
connect: connect,

};
} // audioParam

export function stringParam (key) {
return {
get: (host, value) => host.node[alias(host,key)],
set: (host, value) => host.node[alias(host,key)] = value,
connect: (host, key) => connect(host, key)
};
} // stringParam

