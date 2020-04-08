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
host.split = audio.context.createChannelSplitter();
host.merge = audio.context.createChannelMerger();

element.waitForChildren(host, children => {
if (children.length === 0 || children.length > 2) {
app.statusMessage(`${host._id}: must have at least one, and no more than two child elements`);
return;
} // if

host.input.connect(host.split);
host.merge.connect(host.wet);
connect (host.swapInputs, host.swapOutputs);
}); // wait for children

function connect (swapInputs, swapOutputs) {
const channel1 = host.children[0];
const channel2 = host.children.length === 1? null : host.children[1];
//console.debug("split: ", channel1, channel2, swapInputs, swapOutputs);

if (channel1) {
host.split.connect (channel1.input, swapInputs? 1 : 0, 0);
channel1.output.connect (host.merge, 0, swapOutputs? 1 : 0);
console.log(`- channel 1: ${channel1._id} connected`);
} // if

if (channel2) {
host.split.connect (channel2.input, swapInputs? 0 : 1, 0);
channel2.output.connect (host.merge, 0, swapOutputs? 0 : 1);
console.log(`- channel 2: ${channel2._id} connected`);
} // if
} // connect
} // initialize
