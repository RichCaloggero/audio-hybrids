export function $(selector, context = document) {
return context.querySelector(selector);
} // $

export function $$(selector, context = document) {
return context.querySelectorAll(selector);
} // $$

export function _valueOf (selector, context = document) {
return $(selector, context).value;
} // _valueOf
