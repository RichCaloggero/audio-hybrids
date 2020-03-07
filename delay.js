import {define, html, property} from "https://unpkg.com/hybrids@4.1.5/src";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Delay = audioProcessor.create([["delay", "delayTime"]], {
id: `delay${++instanceCount}`,
creator: "createDelay",
defaults: {},


render: ({ mix, bypass, label, delay, defaults }) => {
	console.debug("rendering delay...");
	return html`
<fieldset class="delay">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix)}
${ui.number("delay", "delay", delay, defaults.delay.min, defaults.delay.max, 0.00001)}
</fieldset>
`; // template
} // render
});

define("audio-delay", Delay);

