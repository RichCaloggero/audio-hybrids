import * as ui from "./ui.js";

const keymap = new Map();
let defaultModifiers = "control shift";

document.addEventListener("keyup", e => {

const text = keyToText(eventToKey(e));
if (!text) return true;

if (!keymap.has(text)) return true;
e.preventDefault();
execute(text);
}); // keyboard handler

function execute (text) {
if (!keymap.has(text)) return
const input = keymap.get(text);
//console.debug("execute: ", input);

if (input.type === "checkbox" || input.tagName.toLowerCase() === "button") input.click();
else input.focus();
} // execute



export function defineKey (text, input) {
text = normalizeKeyText(text);
//console.debug("defineKey: ", text, input);

if (keymap.has (text)) {
statusMessage(`key ${text} is already defined; aborting`);
} else {
keymap.set(text, input);
} // if
} // defineKey

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
if (key.key) text += key.key.toLowerCase();
return text.trim();
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

