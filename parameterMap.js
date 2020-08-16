export function parameterMap (object) {
if (object instanceof AudioWorkletNode) return object.parameters;
else if (object instanceof AudioNode) return createParameterMap(object);
else return null;
} // parameterMap

export function dataMap (parameterMap) {
return parameterMap instanceof Map || parameterMap instanceof AudioParamMap? new Map([...parameterMap.entries()].map(p => [p[0], parameterData(p[1])])) : null;
} // dataMap

function createParameterMap (node) {
return (
new Map(
Object.getOwnPropertyNames(Object.getPrototypeOf(node))
.filter(p => typeof(node[p]) === "string" || node[p] instanceof AudioParam)
.map(p => [p, node[p]])
) // new Map
 ); // return
} // createParameterMap

function parameterData (p) {
if (p instanceof AudioParam) {
return {type: "number", default: p.defaultValue, min: p.minValue, max: p.maxValue, automationRate: p.automationRate};
} else if (typeof(p) === "string" || typeof(p) === "number") {
return {type: typeof(p), default: p};
} else {
return null;
} // if
} // parameterData
 
