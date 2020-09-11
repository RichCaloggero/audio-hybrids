export function parameterMap (object) {
if (object instanceof AudioWorkletNode) return object.parameters;
else if (object instanceof AudioNode) return createParameterMap(object);
else return null;
} // parameterMap

function createParameterMap (node) {
return (
new Map(
Object.getOwnPropertyNames(Object.getPrototypeOf(node))
.filter(p => typeof(node[p]) === "number" ||  typeof(node[p]) === "string" || node[p] instanceof AudioParam)
.map(p => [p, node[p]])
) // new Map
 ); // return
} // createParameterMap


export function dataMap (parameterMap) {
return parameterMap instanceof Map || parameterMap instanceof AudioParamMap?
new Map([...parameterMap.entries()].map(p => [p[0], parameterData(p[1])]))
: null;
} // dataMap

function parameterData (p) {
let result = p instanceof AudioParam?
{audioParam: true, default: p.defaultValue, min: p.minValue, max: p.maxValue, automationRate: p.automationRate}
: {default: p};

if (p instanceof AudioParam || p instanceof Number || typeof(p) === "number") {
result.type = result.uiType = "number";
} else if (typeof(p) === "string" || p instanceof String) {
result.type = "string"; result.uiType = "text";
} else if (typeof(p) === "boolean" || p instanceof Boolean) {
result.type = "boolean";

} else {
return null;
} // if

return result;
} // parameterData
 
export function invertMap (m) {
return new Map(
[...m.entries()].map(e => [e[1], e[0]])
); // new Map
} // invertMap



export function addTypeInfo (data) {
return data.type? data
: Object.assign({}, data,
{type: typeof(data.default) === "undefined"? "string" : typeof(data.default)}
);
} // addTypeInfo
