import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as connector from "./connector.js";
import * as ui from "./ui.js";
import * as app from "./app.js";


const defaults = {
type: {default: "allpass"},
frequency: {default: 2000},
q: {default: 2},
gain: {default: 0},
detune: {default: 0},
count: {default: 700}
};

const FilterBank = element.create("filterBank", defaults, initialize, {
count: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => {
initializeFilters(host, host.count, host.type);
app.statusMessage(`${host._id}: ${host.count} filters created`);
} // observe
}, // count

frequency: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => setFilters(host.filters, "frequency", Number(value))
}, // frequency

q: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => {
setFilters(host.filters, "Q", value);
if (host.filters) console.debug(`${host._id}: setting q of ${host.filters.length} filters to ${Number(value)}`);
} // observe
}, // q

type: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => setFilters(host.filters, "type", value)
}, // type

gain: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => setFilters(host.filters, "gain", Number(value))
}, // gain

detune: {
connect: (host, key) => host[key] = element.processAttribute(host, key) || defaults[key].default,
observe: (host, value) => setFilters(host.filters, "detune", Number(value))
}, // detune


render: ({ bypass, mix, label, _defaults, _depth, count, frequency, type, q, gain, detune }) => {
return html`
<fieldset class="filter-bank">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, data: defaults.mix })}

${ui.number("count", "count", count)}
${ui.list("type", "type", type, [
["low pass", "lowpass"],
["high pass", "highpass"],
["band pass", "bandpass"],
"notch",
"peaking",
["all pass", "allpass"],
["low shelf", "lowshelf"],
["high shelf", "highshelf"],
])}
${ui.number("frequency", "frequency", frequency, _defaults.frequency)}
${ui.number("q", "q", q, _defaults.q)}

${ui.number("gain", "gain", gain, _defaults.gain)}
${ui.number("detune", "detune", detune, _defaults.detune)}
</fieldset>
`; // template
} // render
});

define ("audio-filter-bank", FilterBank);


function initialize (host) {
connector.signalReady(host);
} // initialize

function initializeFilters (host, count = 1, type = "lowpass") {
if (host.filters) {
host.input.disconnect(host.filters[0]);
host.filters[host.filters.length-1].disconnect(host.wet);
} // if

host.filters = createFilters(audio.context, count, host.type, host.input, host.wet);
host.filters.forEach(f => {
if (host.q) f.Q.value = Number(host.q);
if (host.frequency) f.frequency.value = Number(host.frequency);
if (host.gain) f.gain.value = Number(host.gain);
if (host.detune) f.detune.value = Number(host.detune);
}); // forEach

} // initializeFilters

function setFilters (filters, prop, value) {
if (!filters || filters.length === 0) return;

filters.forEach(f => {
if (f[prop]) {
f[prop] instanceof AudioParam? f[prop].value = Number(value)
: f[prop] = value;
} // if
}); // forEach
} // setFilters

function createFilters (context, count, type,  input, output) {
const filters = [];
for (let i=0; i<count; i++) {
filters[i] = context.createBiquadFilter();
filters[i].type = type;
} // for

for (let i=0; i<count-1; i++) {
filters[i].connect(filters[i+1]);
} // for

input.connect(filters[0]);
filters[count-1].connect(output);
return filters;
} // createFilters
