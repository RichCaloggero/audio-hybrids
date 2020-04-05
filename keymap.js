import * as ui from "./ui.js";
import * as context from "./context.js";
import {html} from "./hybrids/index.js";

let defaultModifiers = "control";
const keymap = new Map([[
"control /",
{help: "display keyboard help", function: displayKeyboardHelp}
], [
"control space",
{help: "save value", function: ui.saveValue}
],[
"control shift space",
{help: "swap saved and current values", function: ui.swap}
], [
"control alt shift enter",
{help: "define key", function: getKey}
], [
"enter",
{help: "define automation", function: ui.defineAutomation}
], [
"control enter",
{help: "toggle automation", function: ui.toggleAutomation}
], [
"1",
{type: "range", help: "set slider to value = 1", function: ui.setValue1}
], [
"0",
{type: "range", help: "set slider to value = 0", function: ui.setValue0}
], [
"-",
{type: "range", help: "negate slider's value", function: ui.negateValue}
], [
"control home",
{type: "range, number", help: "maximum value", function: ui.setValueMax}
], [
"control end",
{type: "range, number", help: "minimum value", function: ui.setValueMin}
], [
"control arrowUp",
{type: "range, number", help: "increase by 10 times step", function: ui.increaseBy10}
], [
"control shift arrowUp",
{type: "range, number", help: "increase by 100 times step", function: ui.increaseBy100}
], [
"control arrowDown",
{type: "range, number", help: "decrease by 10 times step", function: ui.decreaseBy10}
], [
"control shift arrowDown",
{type: "range, number", help: "decrease by 100 times step", function: ui.decreaseBy100}
]]); // new map

export function globalKeyboardHandler (e) {
const text = keyToText(eventToKey(e));
if (!text) return true;

return execute(e.composed? e.target.shadowRoot.activeElement : e.target, text, e);
} // global keyboard handler

function execute (target, text, e) {
if (!target) return true;
if (!isDefined(keymap, text)) return true;

const entry = getDefinition(keymap, text);
console.debug("execute: ", text, " target = ", target, " entry = ", entry);

//two types of entries: if entry is an html element then activate it, else it's an object, so call it's function property
if (entry instanceof HTMLElement) {
console.debug(`activate UI 	element`);
preventDefaultAction();
if (entry.type === "checkbox" || entry.tagName.toLowerCase() === "button") entry.click();
else entry.focus();

} else if (entry instanceof Object && entry.function) {
if (entry.type && !ui.stringToList(entry.type).includes(target.type)) return true;
preventDefaultAction();
console.debug(`execute function`);
entry.function (target, text);
target.dispatchEvent(new CustomEvent("change", {bubbles: false}));
target.focus();
} // if

return false;

function preventDefaultAction() {
e.preventDefault();
e.stopPropagation();
e.stopImmediatePropagation();
e.cancelBubble = true;
return false;
} // preventDefaultAction

} // execute

function isDefined (keymap, text) {
return keymap.has(text) || !!getDefinition(keymap, text);
} // isDefined

function getDefinition (keymap, text) {
const entry = [...keymap.entries()].find(entry => entry[0].toLowerCase().trim() === text);
return entry? entry[1] : null;
} // getDefinition

export function defineKey (input, text) {
text = normalizeKeyText(text);
//console.debug("defineKey: ", text, input);

//if (keymap.has (text)) {
//context.statusMessage(`key ${text} is already defined; aborting`);
//} else {
keymap.set(text, input);
//} // if	
} // defineKey

function getKey (input) {
const host = input.getRootNode().host;
const property = input.dataset.name;
const text = findKey(input) || "";

context.prompt(`shortcut for ${host._id} ${property}:`, text, response => {
defineKey(input, response);
input.focus();
});
} // getKey

export function findKey (input) {
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
else if (key.key.length > 1) key.key = capitalize(key.key);
else key.key = key.key.toLowerCase();
//console.debug("textToKey: ", text, key);
return key;
} // textToKey

export function keyToText (key) {
if (!key) return "";
let text = "";
if (key.ctrlKey) text += "control ";
if (key.altKey) text += "alt ";
if (key.shiftKey) text += "shift ";
if (key.key) text += key.key;
return text.toLowerCase();
} keyToText

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


function eventToKey (e) {
if (isModifierKey(e.key)) return null;

return {ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey, key: e.key};
} // eventToKey 


export function isModifierKey (key) {
return key === "Control" || key === "Alt" || key === "Shift";
} // isModifierKey

export function hasModifierKeys (e) {
return e.ctrlKey || e.altKey || e.shiftKey;
} // modifierKeys

function allowedUnmodified (text) {
const allowed = "Enter, Home, End, PageUp, PageDown, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Delete, Backspace"
.split(",").map(x => x.trim().toLowerCase());

return allowed.includes(text.trim().toLowerCase());
} // allowedUnmodified

function capitalize (s) {
return `${s[0].toUpperCase()}${s.slice(1)}`;
} // capitalize


function displayKeyboardHelp (input) {
context.displayDialog({
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
`activate ${item.getRootNode().host._id} ${ui.getLabelText(item) || item.dataset.name}`
: item.help;
} // getHelpText
} // keyboardHelp
