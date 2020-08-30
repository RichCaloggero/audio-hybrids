let definitionRequests = [];

import * as automation from "./automation.js";
import * as utils from "./utils.js";
import * as app from "./app.js";
import {html} from "./hybrids/index.js";

let defaultModifiers = "control";
const savedValues = new Map();
const keymap = new Map([[
"control /",
{help: "display keyboard help", function: displayKeyboardHelp}
], [
"control space",
{type: "number, range", help: "save value", function: saveValue}
],[
"control shift space",
{type: "range, number", help: "swap saved and current values", function: swapValues}
], [
"control alt shift enter",
{help: "define key", function: getKey}
], [
"enter",
{help: "define automation", function: automation.defineAutomation}
], [
"control enter",
{help: "toggle automation", function: automation.toggleAutomation}
], [
"1",
{type: "range", help: "set slider to value = 1", function: setValue1}
], [
"0",
{type: "range", help: "set slider to value = 0", function: setValue0}
], [
"control m",
{type: "number, range", help: "negate slider's value", function: negateValue}
], [
"control home",
{type: "range, number", help: "maximum value", function: setValueMax}
], [
"control end",
{type: "range, number", help: "minimum value", function: setValueMin}
], [
"control arrowUp",
{type: "range, number", help: "increase by 10 times step", function: increaseBy10}
], [
"control shift arrowUp",
{type: "range, number", help: "increase by 100 times step", function: increaseBy100}
], [
"control arrowDown",
{type: "range, number", help: "decrease by 10 times step", function: decreaseBy10}
], [
"control shift arrowDown",
{type: "range, number", help: "decrease by 100 times step", function: decreaseBy100}
]]); // new map

export function initialize () {
	processKeyDefinitionRequests();
app.root.addEventListener("keydown", globalKeyboardHandler);
} // initialize

export function globalKeyboardHandler (e) {
const text = keyToText(eventToKey(e));
//console.debug(`globalKeyboardHandler: ${text}`);
if (!text) return true;

return execute(e.composed? e.target.shadowRoot.activeElement : e.target, text, e);
} // global keyboard handler

function execute (target, text, e) {
if (!target) return true;
if (!isDefined(keymap, text)) return true;

const entry = getDefinition(keymap, text);
//console.debug("execute: ", text, " target = ", target, " entry = ", entry);

//two types of entries: if entry is an html element then activate it, else it's an object, so call it's function property
if (entry instanceof HTMLElement) {
//console.debug(`activate UI 	element`);
preventDefaultAction(e);
if (entry.type === "checkbox" || entry.tagName.toLowerCase() === "button") entry.click();
else entry.focus();

} else if (entry instanceof Object && entry.function) {
if (entry.type && !utils.stringToList(entry.type).includes(target.type)) return true;
preventDefaultAction(e);
//console.debug(`execute function ${entry.function.name}`);
entry.function (target, text);
target.dispatchEvent(new CustomEvent("change", {bubbles: false}));
target.focus();
} // if

return false;


} // execute

export function preventDefaultAction(e) {
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();
e.cancelBubble = true;
return false;
} // preventDefaultAction

function isDefined (keymap, text) {
return keymap.has(text) || !!getDefinition(keymap, text);
} // isDefined

function getDefinition (keymap, text) {
const entry = [...keymap.entries()].find(entry => entry[0].toLowerCase().trim() === text);
return entry? entry[1] : null;
} // getDefinition

export  function requestKeyDefinition (definition) {
//console.debug(`requestDefinition: ${definition.host._id}, ${definition.property}, ${definition.text}`);
definitionRequests.push(definition);
} // requestKeyDefinition

export function defineKey (input, text) {
text = normalizeKeyText(text);
//console.debug("defineKey: ", text, input);

const oldKey = findKey(keymap, input);
if (oldKey) keymap.delete(oldKey);
keymap.set(text, input);
} // defineKey

function processKeyDefinitionRequests () {
console.log(`processDefinitionRequests: processing ${definitionRequests.length} definition requests`);
definitionRequests.forEach(request => {
try {
//console.debug("definition request: ", request);
const input = utils.findUiControl(request.host, request.property);

if (input) {
defineKey(input, request.text);

} else {
throw new Error(`bad shortcut definition specified for ${request.host._id}. ${request.property}; skipped`);
} // if

} catch (e) {
console.error(`${e.message} at ${e.lineNumber}`);
app.statusMessage(e.message);
} // catch
}); // processRequest

definitionRequests = [];
} // processKeyDefinitionRequests


function getKey (input) {
const host = input.getRootNode().host;
const property = input.dataset.name;
const text = findKey(keymap, input) || "";

app.prompt(`shortcut for ${host._id} ${property}:`, text, response => {
if (response !== false) defineKey(input, response);
input.focus();
});
} // getKey

export function findKey (keymap, input) {
const entry = [...keymap.entries()].find(item => item[1] === input);
return entry? entry[0] : "";
} // findKey


export function textToKey (text) {
if (!text) return null;
let t = text.split(" ").map(x => x.trim());
if (t.length === 1) t = `${defaultModifiers} ${t[0]}`.split(" ");
//console.debug("textToKey: ", t);

const key = {};
key.ctrlKey = (t.includes("control") || t.includes("ctrl"));
key.altKey = t.includes("alt");
key.shiftKey = t.includes("shift");
key.key = t[t.length-1];
//console.debug("- key: ", key);

if (!key.key) throw new Error(`textToKey: ${text} is an invalid key descriptor; character must be last component as in "control shift x"`);
else if (key.key.length > 1) key.key = utils.capitalize(key.key);
else key.key = key.key.toLowerCase();
//console.debug("textToKey: ", text, key);
return key;
} // textToKey

export function normalizeKeyText (text) {
return keyToText(textToKey(text));
} // normalizeKeyText

function normalizeKey (key) {
return textToKey(keyToText(key));
} // normalizeKey

function compareKeys (k1, k2) {
return (
k1.ctrlKey === k2.ctrlKey
&& k1.altKey === k2.altKey
&& k1.shiftKey === k2.shiftKey
&& k1.key.toLowerCase() === k2.key.toLowerCase()
); // return
} // compareKeys

export function keyToText (key) {
if (!key) return "";
let text = "";
if (key.ctrlKey) text += "control ";
if (key.altKey) text += "alt ";
if (key.shiftKey) text += "shift ";
if (key.key) {
if (key.key === " ") text += "space";
else text += key.key;
} // if

return text.toLowerCase();
} keyToText

export function eventToKey (e) {
if (isModifierKey(e.key)) return null;

return {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key};
} // eventToKey 


export function isModifierKey (key) {
return ["control", "ctrl", "shift", "alt", "meta"].includes(key.trim().toLowerCase());
} // isModifierKey



export function hasModifierKeys (e) {
return e.ctrlKey || e.altKey || e.shiftKey;
} // modifierKeys

function allowedUnmodified (text) {
const allowed = "Enter, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Delete, Backspace"
.split(",").map(x => x.trim().toLowerCase());

return allowed.includes(text.trim().toLowerCase());
} // allowedUnmodified

export function saveValue (input) {
savedValues.set(input, input.value);
app.statusMessage(`${input.value}: value saved.`);
} // saveValue

export function swapValues (input) {
if (savedValues.has(input)) {
const old = savedValues.get(input);
savedValues.set(input, input.value);
input.value = old;
app.statusMessage(old);
} else {
app.statusMessage("No saved value");
} // if
} // swapValues


function displayKeyboardHelp (input) {
app.displayDialog({
title: "Keyboard Help",
description: "",
content: getKeyboardHelp(input),
returnFocus: input
});
} // displayKeyboardHelp

function getKeyboardHelp (input) {
return html`<table>
<tr><th>key</th><th>description</th></tr>
${[...keymap.entries()].map(entry =>
html`<tr><th>${entry[0]}</th>
<td>${getHelpText(entry[1])}</td></tr>
`)}
</table>
`; // end

function getHelpText (item) {
return item instanceof HTMLElement?
`activate ${item.getRootNode().host._id} ${utils.getLabelText(item) || item.dataset.name}`
: item.help;
} // getHelpText
} // keyboardHelp



function clamp (value, min=0, max=1) {
//console.debug(`clamp: ${value}, ${min}, ${max}`);
if (value > max) return max;
else if (value < min) return min;
else return value;
} // clamp


function setValue1 (input) {input.value = clamp(1, input.min, input.max);}
function setValue0 (input) {input.value = clamp(0, input.min, input.max);}
function negateValue (input) {input.value = clamp(-1*input.value, input.min, input.max);}

function setValueMax (input) {input.value = clamp(input.max, input.min, input.max);}
function setValueMin (input) {input.value = clamp(input.min, input.min, input.max);}

function increaseBy10 (input) {input.value = clamp(Number(input.value) + (10 * Number(input.step)), Number(input.min), Number(input.max));}
function increaseBy100 (input) {input.value = clamp(Number(input.value) + (100 * Number(input.step)), Number(input.min), Number(input.max));}

function decreaseBy10 (input) {input.value = clamp(Number(input.value) - (10 * Number(input.step)), Number(input.min), Number(input.max));}
function decreaseBy100 (input) {input.value = clamp(Number(input.value) - (100 * Number(input.step)), Number(input.min), Number(input.max));}
