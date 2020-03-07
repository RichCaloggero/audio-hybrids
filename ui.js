import {html} from "https://unpkg.com/hybrids@4.1.5/src";
import * as context from "./context.js";

const savedValues = new Map();

export function number (label, name, defaultValue, min,max,step, type="number") {
//console.debug(`ui.number: ${name} default is ${defaultValue}`);
return html`<label>${label}: <input type="${type}" defaultValue="${defaultValue}" onchange="${html.set(name)}" min="${min}" max="${max}" step="${step}"></label>`;


} // number

export function text (label, name, defaultValue) {
return html`<label>${label}: <input type="text" defaultValue="${defaultValue}" onchange="${html.set(name)}"></label>`;
} // text

export function boolean (label, name, defaultValue) {
return html`<label>${label}: <input type="checkbox" defaultValue="${defaultValue? 'checked' : ''}" onclick="${(host, event) => host[name] = event.target.checked}"></label>`;
} // boolean

export function list(label, name, defaultValue, options) {
return html`<label>${label}: <select onchange="${html.set(name)}">${init(options, defaultValue)}</select></label>`;

function init(options, defaultValue) {
return options.map(option => {
if (isSelected(option, defaultValue)) return (
option instanceof Array? html`<option selected value="${option[1] || option[0]}">${option[0]}</option>`
: html`<option selected value="${option}">${option}</option>`
);
else return (
option instanceof Array? html`<option value="${option[1] || option[0]}">${option[0]}</option>`
: html`<option value="${option}">${option}</option>`
);
}); // map

function isSelected (option, defaultValue) {
if (!defaultValue || typeof(defaultValue) !== "string") return "";
//console.debug(`isSelected: ${option}, ${defaultValue}`);
defaultValue = defaultValue.trim().toLowerCase();
return option instanceof Array?
defaultValue === option[0].toLowerCase().trim() || defaultValue === option[1].toLowerCase().trim()
: defaultValue === option.toLowerCase().trim();
} // isSelected
} // init
} // list

export function commonControls (bypass, mix, defaults) {
return html`
${boolean("bypass", "bypass", false)}
${number("mix", "mix", mix, defaults.mix.min, defaults.mix.max, defaults.mix.step)}
`; // return
} // commonControls


export function saveValue (input) {
savedValues.set(input, input.value);
context.statusMessage(`${input.value}: value saved.`);
} // saveValue

export function swapValues (input) {
if (savedValues.has(input)) {
const old = savedValues.get(input);
savedValues.set(input, input.value);
input.value = old;
context.statusMessage(old);
} else {
context.statusMessage(`No saved value; press enter to save.`);
} // if
} // swapValues

export function getKey (input) {
const dialog = shadowRoot.querySelector("#defineKeyDialog");
const ok = dialog.querySelector(".ok");
const closeButton = dialog.querySelector(".close");

dialog.removeAttribute("hidden");
dialog.querySelector(".control").focus();

closeButton.addEventListener ("click", close);
ok.addEventListener("click", () => {
dialog.setAttribute("hidden", true);
const text = keyToText({
ctrlKey: dialog.querySelector(".control").checked,
altKey: dialog.querySelector(".alt").checked,
shiftKey: dialog.querySelector(".shift").checked,
key: dialog.querySelector(".key").value
});
defineKey(text, input);
close();
}); // ok

function close () {
dialog.setAttribute("hidden", true);
input.focus();
} // close
} // getKey

export function handleUserKey (e) {
const text = keyToText(eventToKey(e));
const elements = userKeymap.get(text);
if (!elements) return false;

if (elements && elements.length && elements.length > 0) {
//console.debug(`handleUserKeys: found ${elements.length} elements attached to ${text}`);
const input = e.target;
let focus = elements[0];
if (elements.length > 1) {
focus = findNextFocus(elements, input);
} // if

if (focus) {
focus.focus();
e.preventDefault();
return true;
} // if
} // if

return false;

function findNextFocus (list, item) {
const index = list.indexOf(item);
if (index < 0) return list[0];
else if (index === list.length - 1) return list[0];
else return list[index+1];
} // findNextFocus
} // handleUserKey

export function defineKey (text, element) {
if (!text || !element) return;
text = normalizeKeyText(text);
let elements = userKeymap.get(text);

if (elements) elements.push(element);
else elements = [element];
userKeymap.set(text, elements);
//console.debug (`define key ${text} maps to ${elements.slice(-1)}`);
} // defineKey

export function textToKey (text) {
let t = text.split(" ").map(x => x.trim());
if (t.length === 1) t = `${defaultModifiers} ${t[0]}`.split(" ");

const key = {};
key.ctrlKey = (t.includes("control") || t.includes("ctrl"));
key.altKey = t.includes("alt");
key.shiftKey = t.includes("shift");
key.key = t[t.length-1];

if (!key.key) throw new Error(`textToKey: ${text} is an invalid key descriptor; character must be last component as in "control shift x"`);
else if (key.key.toLowerCase() === "space") key.key = " ";
else if (key.key.toLowerCase() === "enter") key.key = "Enter";
else key.key = key.key.substr(0,1).toLowerCase();
return key;
} // textToKey

export function keyToText (key) {
let text = "";
if (key.cntrlKey) text += "control ";
if (key.altKey) text += "alt ";
if (key.shiftKey) text += "shift ";
if (key.key) text += key.key.toLowerCase();
return text.trim();
} keyToText

export function normalizeKeyText (text) {
return keyToText(textToKey(text));
} // normalizeKeyText

function compareKeys (k1, k2) {
return (
k1.ctrlKey === k2.ctrlKey
&& k1.altKey === k2.altKey
&& k1.shiftKey === k2.shiftKey
&& k1.key.toLowerCase() === k2.key.toLowerCase()
); // return
} // compareKeys


function eventToKey (e) {
return {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key};
} // eventToKey 


export function isModifierKey (key) {
return key === "Control" || key === "Alt" || key === "Shift";
} // isModifierKey

export function hasModifierKeys (e) {
return e.ctrlKey || e.altKey || e.shiftKey;
} // modifierKeys

function allowedUnmodified (key) {
const allowed = "Enter, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Delete, Backspace"
.split(",").map(x => x.trim());

return allowed.includes(key);
} // allowedUnmodified

function handleSpecialKeys (e) {
const key = e.key;
if (isModifierKey(key)) return true;
if (handleUserKey(e)) return false;

const input = e.target;
switch (key) {
case " ": if(e.ctrlKey) swapValues(input);
else return true;
break;

case "Enter":
if (e.ctrlKey && e.altKey && e.shiftKey) {
defineKey(getKey(input), input);
} else if(e.ctrlKey) {
saveValue(input);
} else {
return true;
} // if
break;

default: return true;
} // switch

return false;alert("false man");

} // handleSpecialKeys


function processValues (values) {
if (values instanceof String || typeof(values) === "string") {
values = values.trim();
if (values.charAt(0) !== "[" && values.includes(",") && !values.includes('"')) {
return values.split(",")
.map (value => value.trim());
} else {
try {values = JSON.parse(values);
} catch (e) {values = [];} // catch
} // if
} // if

if (values && (values instanceof Array)) {
values = values.map (value => {
if (typeof(value) !== "object") value = {value: value, text: value};
else if (value instanceof Array) value = {
value: value[0],
text: value.length > 1? value[1] : value[0]
};

return value;
}); // map
} // if

return values;
} // processValues

