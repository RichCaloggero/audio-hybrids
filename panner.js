import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as audioProcessor from "./audioProcessor.js";
import * as ui from "./ui.js";

let instanceCount = 0;

const Panner = audioProcessor.create([
["x", "positionX"],
["y", "positionY"],
["z", "positionZ"],
["innerAngle", "coneInnerAngle"],
["outerAngle", "coneOuterAngle"],
["outerGain", "coneOuterGain"],

"orientationX", "orientationY", "orientationZ",
"panningModel", "distanceModel", "maxDistance", "refDistance", "rolloffFactor",
], {
id: `panner${++instanceCount}`,
node: null,
creator: "createPanner",


render: ({ bypass, mix, label,  defaults,
x,y,z,
orientationX, orientationY, orientationZ,
distanceModel, maxDistance, refDistance, rolloffFactor,
panningModel, innerAngle, outerAngle, outerGain,
}) => {
	return html`
<fieldset class="panner">
<legend><h2>${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}

${ui.number("x", "x", x, defaults)}
${ui.number("y", "y", y, defaults)}
${ui.number("z", "z", z, defaults)}

${ui.number("orientationX", "orientationX", orientationX, defaults)}
${ui.number("orientationY", "orientationY", orientationY, defaults)}
${ui.number("orientationZ", "orientationZ", orientationZ, defaults)}

${ui.number("panningModel", "panningModel", panningModel, defaults)}
${ui.number("distanceModel", "distanceModel", distanceModel, defaults)}
${ui.number("maxDistance", "maxDistance", maxDistance, defaults)}
${ui.number("refDistance", "refDistance", refDistance, defaults)}
${ui.number("rolloffFactor", "rolloffFactor", rolloffFactor, defaults)}

${ui.number("innerAngle", "innerAngle", innerAngle, defaults)}
${ui.number("outerAngle", "outerAngle", outerAngle, defaults)}
${ui.number("outerGain", "outerGain", outerGain, defaults)}
</fieldset>
`;
} // render
});

define("audio-panner", Panner);
