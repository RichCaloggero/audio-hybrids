import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./element.js";
import * as ui from "./ui.js";

const defaults = {
panningModel: {default: "HRTF"}
};

const audioPanner = element.create("panner", defaults, "createPanner", element.connect, [
["x", "positionX"],
["y", "positionY"],
["z", "positionZ"],
["innerAngle", "coneInnerAngle"],
["outerAngle", "coneOuterAngle"],
["outerGain", "coneOuterGain"],

"orientationX", "orientationY", "orientationZ",
"panningModel", "distanceModel", "maxDistance", "refDistance", "rolloffFactor",
], {


render: ({ bypass, mix, label,
_depth, x,y,z,
orientationX, orientationY, orientationZ,
distanceModel, maxDistance, refDistance, rolloffFactor,
panningModel, innerAngle, outerAngle, outerGain,
}) => {
	return html`
<fieldset class="panner">
<legend><h2 role="heading" aria-level="${_depth}">${label}</h2></legend>
${ui.commonControls(bypass, mix, defaults)}

${ui.number("x", "x", x, defaults)}
${ui.number("y", "y", y, defaults)}
${ui.number("z", "z", z, defaults)}

${ui.number("orientationX", "orientationX", orientationX, defaults)}
${ui.number("orientationY", "orientationY", orientationY, defaults)}
${ui.number("orientationZ", "orientationZ", orientationZ, defaults)}

${ui.text("panningModel", "panningModel", panningModel)}
${ui.text("distanceModel", "distanceModel", distanceModel)}
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

