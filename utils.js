export function $(selector, context = document) {
return context.querySelector(selector);
} // $

export function $$(selector, context = document) {
return context.querySelectorAll(selector);
} // $$

export function _valueOf (selector, context = document) {
return $(selector, context).value;
} // _valueOf

function getModuleName () {
try {
return getBasename(new URL(import.meta.url).pathname);
} catch (e) {
return "";
} // catch

} // getModuleName

function getBasename (pathname) {
const name= pathname.split("/").slice(-1)[0]
.split(".");

return name .length > 1? name.slice(0,-1).join(".") : name;
} // getBasename
