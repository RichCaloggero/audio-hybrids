import {define, html, property} from "./hybrids/index.js";
import * as ui from "./ui.js";
import * as element from "./createElement.js";

const defaults = {
createDescriptors,
base: {default: 0},
exp: {default: 0},
}; // defaults

const Test = element.create("test", defaults, initialize);
Test.render = ui.createRenderer(defaults);

define("audio-test", Test);

function initialize (host) {
console.debug("iniitialize...");
} // initialize

function createDescriptors (data) {
return Object.fromEntries(Object.entries(data).map(createDescriptor));

function createDescriptor (entry) {
const [name, data] = entry;
return {[name]: {
connect: (host, key) => host[key] = ui.processAttribute(host, key) || data[name].default,
observe: (host, value) => _set(host, name, value, data)
}}; // return
} // createDescriptor
} // createDescriptors

function _set (host, name, value, data) {
console.debug(`set ${name} to ${value}`);
} // _set

