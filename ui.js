import {html} from "https://unpkg.com/hybrids@4.1.5/src";

export function number (label, name, defaultValue, min=0, max=1, step=1, type="range") {
return html`<label>${label}: <input type="${type}" defaultValue="${defaultValue}" onchange="${html.set(name)}" min="${min}" max="${max}" step="${step}"></label>`;
} // number

export function text (label, name, defaultValue) {
return html`<label>${label}: <input type="text" defaultValue="${defaultValue}" oninput="${html.set(name)}"></label>`;
} // text

export function boolean (label, name, defaultValue) {
return html`<label>${label}: <input type="checkbox" defaultValue="${defaultValue? 'checked' : ''}" onclick="${(host, event) => host[name] = event.target.checked}"></label>`;
} // boolean

export function list(label, name, options, defaultValue) {
return html`<label>${label}: <select onchange="${html.set(name)}">${init(options)}</select></label>`;

function init(options, index) {
return options.map(option => option instanceof Array?
html`<option value="${option[1] || option[0]}">${option[0]}</option>`
: html`<option value="${option}">${option}</option>`
); // map
} // init
} // list

