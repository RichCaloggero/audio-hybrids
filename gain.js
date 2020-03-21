import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
gain: {type: "range", default: 1, min: -10, max: 10}
};

const Gain = element.create("gain", defaults, "createGain", element.connect, ["gain"], {

render: ({ mix, bypass, label, _depth, gain }) => {
console.debug(`${label}: rendering...`);
return html`
<fieldset class="destination">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}
${ui.number("gain", "gain", gain, defaults)}
</fieldset>
`; // template
} // render
});

define ("audio-gain", Gain);


