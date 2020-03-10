


export function getPropertyInfo (host, node) {
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

