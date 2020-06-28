import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";
import * as app from "./app.js";


const defaults = {};

const Split = element.create("split", defaults, initialize, {
swapInputs: {
connect: (host, key) => host[key] = host.hasAttribute("swap-inputs") || false
}, // swapInputs

swapOutputs: {
connect: (host, key) => host[key] = host.hasAttribute("swap-outputs") || false
}, // swapOutputs


render: ({ mix, bypass, label, _depth }) => {
return html`
<fieldset class="split">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
</fieldset>
<slot></slot>
`; // template
} // render
});

define ("audio-split", Split);


function initialize (host) {
host.split = audio.context.createChannelSplitter(2);
host.merge = audio.context.createChannelMerger(2);

element.waitForChildren(host, children => {
if (children.length === 0 || children.length > 2) {
console.error(`${host._id}: must have at least one, and no more than two child elements`);
throw new Error(`${host._id}: must have at least one, and no more than two child elements`);
} // if

host.input.connect(host.split);
host.merge.connect(host.wet);

connect (host.split, host.merge, children, host.swapInputs, host.swapOutputs);
}); // wait for children

function connect (split, merge, children, swapInputs, swapOutputs) {
const channel1 = children[0];
const channel2 = children.length === 1? null : children[1];
//console.debug("split: ", channel1, channel2, swapInputs, swapOutputs);

if (channel1) {
split.connect (channel1.input, swapInputs? 1 : 0, 0);
channel1.output.connect (merge, 0, swapOutputs? 1 : 0);
console.log(`${host._id}: channel 1: ${channel1._id} connected`);
} // if

if (channel2) {
split.connect (channel2.input, swapInputs? 0 : 1, 0);
channel2.output.connect (merge, 0, swapOutputs? 0 : 1);
console.log(`${host._id}: channel 2: ${channel2._id} connected`);
} // if
} // connect
} // initialize
