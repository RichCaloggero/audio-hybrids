 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const parameters = [
["preDelay", 0, 0, sampleRate - 1, "k-rate"],	
			["bandwidth", 0.9999, 0, 1, "k-rate"],	
			["inputDiffusion1", 0.75, 0, 1, "k-rate"],	
			["inputDiffusion2", 0.625, 0, 1, "k-rate"],	
			["decay", 0.5, 0, 1, "k-rate"],	
			["decayDiffusion1", 0.7, 0, 0.999999, "k-rate"],	
			["decayDiffusion2", 0.5, 0, 0.999999, "k-rate"],	
			["damping", 0.005, 0, 1, "k-rate"],	
			["excursionRate", 0.5, 0, 2, "k-rate"],	
			["excursionDepth", 0.7, 0, 2, "k-rate"],	
			["wet", 0.3, 0, 1, "k-rate"],	
			["dry", 0.6, 0, 1, "k-rate"]
];

const defaults = parameters.map(x => new Object({
[x[0]]: {
			defaultValue: x[1],
			minValue: x[2],
			maxValue: x[3],
			automationRate: x[4]
}); // new Object


const Reverb = element.create("reverb", defaults, initialize, definitions()); // element.create

reverb.render = ({ label, _depth, bypass, mix, 
preDelay,
			bandwidth,
			inputDiffusion1,
			inputDiffusion2,
decay, decayDiffusion1, decayDiffusion2,
damping,
			excursionRate,
			excursionDepth,
			wet,
			dry
}) => {
return html`
<fieldset class="reverb">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}

${ui.number("preDelay", "preDelay", preDelay)}
${ui.number("preDelay", "preDelay", preDelay)}
			${ui.number("bandwidth", "bandwidth", bandwidth)}
${ui.number("inputDiffusion1", "inputDiffusion1", inputDiffusion1)}
${ui.number("inputDiffusion2", "inputDiffusion2", inputDiffusion2)}
${ui.number("decay", "decay", decay)}
ui.number("decayDiffusion1", "decayDiffusion1", decayDiffusion1)}
ui.number("decayDiffusion2", "decayDiffusion2", decayDiffusion2)}
			${ui.number("damping", "damping", damping)}
			${ui.number("excursionRate", "excursionRate", excursionRate)}
			${ui.number("excursionRate", "excursionRate", excursionRate)}
${ui.number("wet", "wet", wet)}
${ui.number("dry", "dry", dry)}
</fieldset>
`;
}; // render


define("audio-reverb", Reverb);


async function initialize (host) {
Audio.context.audioWorklet.addModule("reverb", "./dattorroReverb.js");
host.node = new AudioWorkletNode("reverb", { outputChannelCount: [2]});
host.input.connect(host.node).connect(host.wet);

element.signalReady(host);
} // initialize

function definitions () {
return parameters.map(p => { p[0])
.map(name => parameterDefinition(name)
} // definitions 

function parameterDefinition (name) {
return {[name]: {
connect: host[key] = (host, key) => element.processAttribute(host, key) || defaults[name],
observe: (host, value) => host.node[name].value = Number(value)
}; // [name]
} // definition
