function getParameters (object) {
if (object instanceof AudioWorkletNode)
return new Map(
[...object.parameters.entries()]
.map(p => [p[0], getData(p[1])])
); // new Map

if (object instanceof AudioNode) return getParameterMap(object);

return null;
} // getParameters

function getParameterMap (node) {
return (
new Map(
Object.getOwnPropertyNames(Object.getPrototypeOf(node))
.filter(p => typeof(node[p]) === "string" || node[p] instanceof AudioParam)
.map(p => [p, getData(node[p])])
) // new Map
 ); // return
} // getParameterMap

function getData (p) {
if (p instanceof AudioParam) {
return {default: p.defaultValue, min: p.minValue, max: p.maxValue};
} else if (typeof(p) === "string" || typeof(p) === "number") {
return {default: p};
} else {
return null;
} // if
} // getData
 