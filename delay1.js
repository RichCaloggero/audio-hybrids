 import {define, html, property} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";


const defaults = {}; // sefaults


const Delay1 = element.create("delay1", defaults, initialize, {

render: ({ mix, bypass, label, _depth }) => {
return html`
<fieldset class="delay1">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
</fieldset>
`;
} // render
});

define ("audio-delay1", Delay1);

async function initialize (host) {
await audio.context.audioWorklet.addModule("delay1.worklet.js");
host.node = new AudioWorkletNode(audio.context, "delay1");
host.input.connect(host.node).connect(host.wet);
element.signalReady(host);
console.debug(`${host._id} initialized`);
} // initialize

