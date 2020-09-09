import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
};

const Pulse = element.create("pulse", defaults, initialize, {
width: {
connect: (host, key) => host[key] = Number(host.getAttribute("width")) || 1
}, // width

left: {
set: (host, value) => {
trigger(host, host.width, 0);
return false;
}
}, // left

right: {
set: (host, value) => {
trigger(host, host.width, 1);
return false;
}
}, // right

both: {
set: (host, value) => {
trigger(host, host.width);
return false;
}
}, // both


render: ({ label, _depth, left, right, both, width }) => {
return html`
<fieldset class="pulse-gen">
${ui.legend({ label, _depth })}
${ui.number("width", "width", width)}
${ui.boolean({ label: "left channel", name: "left", defaultValue: false})}
${ui.boolean({ label: "right channel", name: "right", defaultValue: false})}
</fieldset>
`; // template
} // render
});

define ("audio-pulse", Pulse);


function initialize (host) {
host.node = audio.context.createGain(); // dummy source for now
host.node.connect(host.output);
host.input = null;
element.signalReady(host);
} // initialize

function trigger (host, sampleCount, channel) {
const source = createSource(createBuffer(sampleCount, 1.0));
if (channel === 0 || channel === 1) {
const split = audio.context.createChannelSplitter(2);
const merge = audio.context.createChannelMerger(2);
source.connect(split).connect(merge, channel, channel).connect(host.output);
} else {
source.connect(host.output);
} // if

source.start();
} // trigger

function createSource (buffer) {
const source = audio.context.createBufferSource();
source.buffer = buffer;
return source;
} // createSource


function createBuffer (sampleCount, value) {
const buffer = audio.context.createBuffer(2, sampleCount, audio.context.sampleRate);

for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
  // This gives us the actual array that contains the data
  const data = buffer.getChannelData(channel);
  for (var i = 0; i < buffer.length; i++) data[i] = value;
} // loop over channels
return buffer;
} // createBuffer

