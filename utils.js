export function isContainer (host) {
const containers = ["series", "parallel", "split"];
return containers.includes(host._name);
} // isContainer

export function findUiControl (host, property) {
const element = host.shadowRoot?.querySelector(`[data-name='${property}']`);
//console.debug(`findUiControl: ${host._id}.${property}: ${element}`);
return element;
} // findUiControl

export function parse (expression) {
if (!expression) return [];

let parser =
/^([-+]?[\d.]+)$|^([-\w]+)$|([-\w]+?)\{(.+?)\}/gi;
//console.debug("intermediate: ", [...expression.matchAll(parser)]);

const result = [...expression.matchAll(parser)]
.map(a => a.filter(x => x))
.map(a => a.slice(1));
//console.debug("parse: ", result);
return result;
} // parse

export function findAllUiElements () {
return Array.from(document.querySelectorAll("audio-context *"))
.map(x => Array.from(x.shadowRoot.querySelectorAll("input,select,button")))
.flat(9);
} // findAllUiElements

export function getLabelText (input) {
const groupLabel = input.closest("fieldset").querySelector("[role='heading']").textContent;
return (`${groupLabel} / ${input.parentElement.textContent}`).trim();
} // getLabelText

export function stringToList (s) {
const r = /, *?| +?/i;
return s.split(r).filter(s => s.length > 0);
} // stringToList


export function capitalize (s) {
return `${s[0].toUpperCase()}${s.slice(1)}`;
} // capitalize

export function separateWords (s) {
return capitalize(s.replace(/([A-Z])/g, " $1").toLowerCase().trim());
} // separateWords

export function dbToGain (db) {
return Math.pow(10, (db / 20));
} dbToGain

export function gainToDb (gain) {
return 20 * Math.log10( gain );
} // gainToDb


export function $(selector, context = document) {
return context.querySelector(selector);
} // $

export function $$(selector, context = document) {
return context.querySelectorAll(selector);
} // $$

export function _valueOf (selector, context = document) {
return $(selector, context).value;
} // _valueOf

export function getModuleName () {
try {
return getBasename(new URL(import.meta.url).pathname);
} catch (e) {
return "";
} // catch

} // getModuleName

export function getBasename (pathname) {
const name= pathname.split("/").slice(-1)[0]
.split(".");

return name .length > 1? name.slice(0,-1).join(".") : name;
} // getBasename
