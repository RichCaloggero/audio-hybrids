import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as connector from "./connector.js";
import * as ui from "./ui.js";


const Series = {
id: "series",
label: "",
node: null,


_connected: property(false, connect),

render: ({ label, type, frequency, q, gain, detune }) => html`
<fieldset class="series">
</fieldset>
<slot></slot>
` // render
};

define("audio-series", Series);

function connect (host, key) {
connector.waitForChildren(host, children => {
const first = children[0];
const last = children[children.length-1];

audio.initialize(host);
if (first !== last) {
children.forEach((child, index) => {
if (index < children.length-1) child.output.connect(children[index+1].input);
}); // forEach
} // if

if (first.input) host.input.connect(first.input);
if (last.output) last.output.connect(host.wet);
}); // waitForChildren
} // connect

