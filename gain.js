import {define, html, property} from "./hybrids/index.js";
import * as element from "./element.js";
import * as ui from "./ui.js";


const defaults = {
gain: {type: "range", default: 1, min: -10, max: 10, step: 0.1}
};

const Gain = element.create("gain", defaults, "createGain", ["gain"], {

render: ({ mix, bypass, label, _depth, gain }) => {
//console.debug(`${label}: rendering...`);
return html`
<fieldset class="gain">
${ui.legend({ label, _depth })}
${ui.commonControls({ bypass, mix, defaults })}
${ui.number("gain", "gain", gain, defaults)}
</fieldset>
`; // template
} // render
});

define ("audio-gain", Gain);


