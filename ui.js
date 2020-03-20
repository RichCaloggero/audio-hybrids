import {html} from "./hybrids/index.js";
import * as context from "./context.js";

const savedValues = new Map();

export function number (label, name, defaultValue, ...rest) {
//console.debug(`ui.number: ${name} default is ${defaultValue}`);
let min, max, step, type;
if (rest.length === 1 && rest[0] instanceof Object) {
try {
({ min, max, step, type } = rest[0][name]);
} catch (e) {
console.error(e);
} // catch

} else {
[min, max, step, type] = rest;
} // if

return html`<label>${label}: <input type="${type || 'number'}" defaultValue="${defaultValue}" onchange="${html.set(name)}" onkeyup="${handleSpecialKeys}"
min="${min}" max="${max}" step="${step}">
</label>`;


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
${number("mix", "mix", mix, defaults.mix.min, defaults.mix.max, defaults.mix.step, defaults.mix.type)}
<br>
`; // return
} // commonControls


function handleSpecialKeys (host, event) {
const key = event.key;
const input = event.target;

if (input.type === "range" && handleRangeInput(key, input)) return false;
//if (isModifierKey(key)) return true;
//if (handleUserKey(e)) return false;

switch (key) {
case " ": if(event.ctrlKey) swapValues(input);
else return true;
break;

case "Enter":
if (event.ctrlKey && event.altKey && event.shiftKey) {
//defineKey(getKey(input), input);
} else if(event.ctrlKey) {
saveValue(input);
} else {
return true;
} // if
break;

default: return true;
} // switch

return false;
} // handleSpecialKeys

function handleRangeInput(key, input) {
const [min, max, value] = [Number(input.min), Number(input.max), Number(input.value)];
switch (key) {
case "0": input.value = Number(0); return true;
case "1": input.value = Number(1); return true;
case "-": input.value = Number(-1 * value); return true;
case ".": if (checkRange(min, max)) input.value = Number((max-min)/2); return true;

default: return false;
} // switch

return false;
} // handleRangeInput

function checkRange (min, max) {
return Number(min) <= Number(max);
} // checkRange


function inRange (value, min = 0, max = 1) {
return typeof(min) === "number" && typeof(max) === "number" && typeof(value) === "number" && min <= value <= max;
} // inRange

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


/*function processValues (values) {
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
*/

