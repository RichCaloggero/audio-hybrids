import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
delay: {default: 0.5, min: 0, max: 1, step: 0.001}
};

const Delay = element.create("delay", defaults, "createDelay", element.connect, [["delay", "delayTime"]], {

render: ({ mix, bypass, label, delay }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="delay">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("delay", "delay", delay, defaults)}
</fieldset>
`; // template
} // render
});

define ("audio-delay", Delay);
