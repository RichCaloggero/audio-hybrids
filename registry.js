let registry = new Map();
export const isDefined = name => registry?.has(name);

/*export function isDefined (name) {
return registry.has(name);
} // isDefined
*/


export function setHostInfo (name, info) {
if (registry?.has(name)) {
throw new Error(`Duplicate host name: ${name}; aborting`);
} else {
registry.set(name, info);
} // if
} // setHostInfo

export function getHostInfo (host) {
const name = host._name;
if (!name) {
console.error(`bad element: aborting;\n`, host);
throw new Error(`bad element`);
} // if


if (registry?.has(name)) return registry.get(name);

throw new Error(`no registry info for ${name}; aborting`);
} // getHostInfo

export function isInitialized (host) {
return host._initialized;
} // isInitialized

export function initializeHost (host) {
host._initialized = true;
console.log (`${host._id}: initialization complete`);
} // initializeHost

