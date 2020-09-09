import {render, html} from "./hybrids/index.js";
import * as app from "./app.js";
import * as automation from "./automation.js";
import * as keymap from "./keymap.js";
import * as utils from "./utils.js";


export function initialize (e) {
console.log("UI initialization complete.");
} // initialize

/// rendering

export function createRenderer (defaults) {
const keys = Object.keys(defaults).filter(renderablePropertyName).filter(name => name !== "bypass" && name !== "mix");

return render((host) => {
const hideOnBypass = app.root?.hideOnBypass || false;

const values = keys.map(k => {
const data = defaults[k];
const heading = data.ui?.heading;
const row = data.ui?.row;

let _html = renderControl(k, host[k], data);
_html = row? html`<br>${_html}` : _html;
_html = heading? html`<h3 role="heading" aria-level="${host._depth+1}">${heading}</h3>\n${_html}` : _html;
return _html;

}); // map


return html`
<fieldset class="${host.tagName.toLowerCase()}">
${legend({ label: host.label, _depth: host._depth })}
${commonControls({ bypass: host.bypass, mix: host.mix, data: defaults.mix })}
<hr>
${!(hideOnBypass && host.bypass) && values}
</fieldset>
`; // html
}); // render}); // callback
} // createRenderer

export function legend ({ _depth=1, label } = {}) {
return html`<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>`;
} // legend

export function commonControls ({ bypass, mix, data = {}} = {}) {
//console.debug("common: mix = ", mix);
return html`
${boolean({ name: "bypass", defaultValue: bypass })}
${number("mix", "mix", mix, data)}
<br>
`; // return
} // commonControls

export function renderControl (name, value, data) {
//console.debug(`renderControl: ${name}, ${value}, `, data);
const control = { name, label: utils.separateWords(name), defaultValue: value || data.default };
//console.debug("renderControl: ", control.name, control.defaultValue, data.type);


switch (data.type) {
case "boolean":
return boolean(control);
break;

case "string":
return text(control);
break;

case "number":
return number(control.label, control.name, control.defaultValue, data);
break;

case "list": 
return list(control.label, control.name, control.defaultValue, data.values);
break;

default: throw new Error(`renderControl: unknown type: ${name}, ${value}, `, data);
} // switch

} // renderControl


export function text ({ label, name, defaultValue }) {
if (!label) label = utils.separateWords(name) || "";
return html`<label>${label}: <input type="text" defaultValue="${defaultValue}" onchange="${html.set(name)}"
accesskey="${name[0]}" data-name="${name}"></label>`;
} // text

export function boolean ({ label, name, defaultValue } = {}) {
if (!label) label = utils.separateWords(name) || "";
//console.debug(`boolean: ${name}, ${defaultValue}`);
return html`<button aria-label="${label}"
aria-pressed="${pressed(defaultValue)}"
onclick="${(host,event) => {
host[name] = !defaultValue;
event.target.setAttribute('aria-pressed', pressed(!defaultValue));
//console.debug(`- changed to ${host[name]}, ${event.target.getAttribute('aria-pressed')}`);
 }}"
data-name="${name}"
accesskey="${name[0]}">
${!defaultValue? 'X' : 'O'}
</button>`;

function pressed (value) {return value? "true" : "false";}
} // boolean


export function number (label, name, defaultValue, data) {
let {step,min,max,uiType} = data;

if (!step && min !== undefined && max !== undefined) step = (max - min) / 100;
if (typeof(min) === "undefined") min = Number.EPSILON;
if (typeof(max) === "undefined") max = Number.MAX_VALUE;
if (typeof(step) === "undefined") step = 1;

return html`
<label>${label}:
<input type="${uiType || 'number'}"
defaultValue="${defaultValue}"
onchange="${html.set(name)}"
min="${min}" max="${max}" step="${step}"
accesskey="${name[0]}"
data-name="${name}">
</label>`;
} // number


export function list(label, name, defaultValue, options) {
return html`<label>${label}: <select onchange="${html.set(name)}"  accesskey="${name[0]}" data-name="${name}">
${init(options, defaultValue)}
</select></label>`;

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


/// processing attributes

/* this function attempts to get the html attribute associated with the supplied key

- if attribute doesn't exist, look up key in _defaults on host (supplied in element's module), or return undefined if no default
- if attribute exists and value is empty string, return true (boolean attribute)
- if attribute exists, try to parse it for default value, shortcut definition, and/or automation spec, or lookup default value in host._defaults, or return undefined
*/


export function processAttribute (host, key, attribute) {
if (!attribute) attribute = key;
//console.debug(`processAttribute: ${host._id}, ${key}, ${attribute}`);
if (!host.hasAttribute(attribute)) return host._defaults[key]?.default || undefined;
const value = host.getAttribute(attribute);

// case boolean attribute, presence with empty string value means true
if (value === "") return true;


const data = getData(host, key, utils.parse(value));
if (host._id === "panner1") console.debug(`processAttribute: `, data);

if (data.automate) automation.requestAutomation(data.automate);
if (data.shortcut) keymap.requestKeyDefinition(data.shortcut);
if (data.default) {
if (data.default === "true") return true;
else if (data.default === "false") return false;
else return data.default;
} // if

return host._defaults[key]?.default || undefined;

function getData (host, property, data) {
const nodeProperty = host.node && host._webaudioProp? host._webaudioProp(property) : "";
return Object.assign({}, ...data.map(item => {
if (item.length === 1) {
return {default: item[0]};
} else {
const [operator, operand] = item;
if (operator === "automate" || operator === "-automate") {
return {automate: {host, property, nodeProperty, text: operand, enabled: operator[0] !== "-"}};
} // if automate

if (operator === "shortcut"){
return {shortcut: {host, property, text: operand}};
} // if shortcut

if (operator === "default") {
return {default: operand};
} // if default
} // if
}) // map
); // assign
} // getData
} // processAttribute

 export function validPropertyName (name) {
return !invalidPropertyNames().includes(name);
} // validPropertyName

export function invalidPropertyNames () {
return ["input", "output", "dry", "wet"]; // need this to be hoisted
} // invalidPropertyNames

 function renderablePropertyName (name) {
const unrenderable = ["hide", "silentBypass"];
return name[0] !== "_"
&& validPropertyName(name)
&& !unrenderable.includes(name);
} // renderableProperty


function isNumericInput (input) {
return input.type === "number" || input.type === "range"
} // isNumericInput



function inRange (value, min = 0, max = 1) {
return typeof(min) === "number" && typeof(max) === "number" && typeof(value) === "number" && min <= value <= max;
} // inRange



