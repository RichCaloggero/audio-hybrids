 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";
import * as app from "./app.js";
import {FrequencyBand} from "./frequencyBand.js";


const defaults = {
order: {min: 1, max: 10, default: 1},
}; // sefaults


const Band = element.create("band", defaults, initialize, {
type: property("lowshelf"),

low: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || undefined,
observe: (host, value) => host.node.low = Number(value)
}, // low

high: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || undefined,
observe: (host, value) => host.node.high = Number(value)
}, // high

gain: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 1,
observe: (host, value) => host.node.gain = Number(value)
}, // gain

order: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 1
}, // order

render: ({ label, mix, bypass, _depth, low, high, gain}) => {
return html`
<fieldset class="multiband">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
${ui.number("low", "low", low)}
${ui.number("high", "high", high)}
${ui.number("gain", "gain", gain)}
</fieldset>
`;
} // render
});

define ("audio-band", Band);

function initialize (host) {
host.node = new FrequencyBand(audio.context, host.getAttribute("type"), host.order);
host.input.connect(host.node.input);
host.node.output.connect(host.wet);

console.log(`${host._id}: frequency band initialized`);
element.signalReady(host);
} // initialize

