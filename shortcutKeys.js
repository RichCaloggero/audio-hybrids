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
