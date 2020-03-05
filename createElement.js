import * as context from "./context.js";

export function createAudioProcessor (...definitions) {
return Object.assign(defaults(),
...definitions.map(definition => definition instanceof Array?
createDescriptors(definition)
: definition
)); // assign

function createDescriptors (props) {
const aliases = [];
const result = Object.assign({}, ...props.map(p => createDescriptor(p)));
result.aliases = aliases;
console.debug(`adding aliases${result.aliases}`);
return result;

function createDescriptor (p) {
const key = p instanceof Array? createAlias(p) : p;
const prop = p instanceof Array? p[0] : p;

console.debug(`creating descriptor ${p}`);
return {[prop]: {
get: (host,value) => {console.debug("evaluating getter"); host.node[key] instanceof AudioParam? host.node[key].value : host.node[key]},
set: (host, value) => host.node[key] instanceof AudioParam? host.node[key].value = Number(value) : host.node[key] = value,
connect: context.connect
}};
} // createDescriptor

function createAlias(p) {
aliases[p[0]] = p[1];
return p[1];
} // createAlias
} // createDescriptors

function defaults () {
return {
label: "",
id: "",
node: null,

bypass: {
get: (host, value) => value,
	set: (host, value) => host.__bypass(value)
},

mix: {
get: (host, value) => value,
	set: (host, value) => host.__mix(value),
},
}; // common properties
}// defaults

} // createAudioProcessor 


