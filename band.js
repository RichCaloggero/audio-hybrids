 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";
import * as band from "./band.class.js";


const defaults = {
order: {min: 1, max: 10, default: 1},
}; // sefaults


const Band = element.create("band", defaults, initialize, {
low: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 0,
observe: (host, value) => this.node.low = Number(value)
}, // low

high: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 0,
observe: (host, value) => this.node.high = Number(value)
}, // high

gain: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 1,
observe: (host, value) => this.node.gain = Number(value)
}, // gain

order: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || 1
}, // order

render: ({ label, mix, bypass, _depth, low, high, gain, order }) => {
return html`
<fieldset class="multiband">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
${ui.number("low", "low", low)}
${ui.number("high", "high", high)}
${ui.number("gain", "gain", gain)}
${ui.number("order", "order", order)}
</fieldset>
`;
} // render
});

define ("audio-band", Band);

function initialize (host) {
host.node = new FrequencyBand(host.input, {low: host.low, high: host.high}, host.order);
} // initialize

