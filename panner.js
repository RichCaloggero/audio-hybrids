import {define, html} from "./hybrids/index.js";
import * as audio from "./audio.js";
import * as element from "./new.element.js";
import * as ui from "./ui.js";

// this helps to define a reasonable order and provides some defaults for step
// should include either default value or type defpending on need

const defaults = {
x: {default: 0, step: 1},
y: {default: 0, step: 1},
z: {default: 0, step: 1},
r: {default: 0, step: 0.1},
a_xy: {default: 0, step: 0.1},
a_xz: {default: 0, step: 0.1},

orientationX: {default: 0, step: 0.1},
orientationY: {default: 0, step: 0.1},
orientationZ: {default: 0, step: 0.1},

panningModel: {default: "HRTF", type: "list", values: ["HRTF", "equalpower"]},
refDistance: {default: 50},
};

const Panner = element.create("panner", defaults, audio.context.createPanner(), [
["x", "positionX"],
["y", "positionY"],
["z", "positionZ"],
["innerAngle", "coneInnerAngle"],
["outerAngle", "coneOuterAngle"],
["outerGain", "coneOuterGain"],
], {

r: {
observe: (host, value) => {
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
}, // set

connect: element.connect,
}, // r

a_xz: {
connect: element.connect,
observe: (host, value) => {
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
}, // observe
}, // a_xz

a_xy: {
connect: element.connect,
observe: (host, value) => {
[host.x, host.y, host.z] = toPolar(host.r, host.a_xy, host.a_xz);
}, // observe
}, // a_xy
}); // element.create

define ("audio-panner", Panner);

function toPolar (r, theta, phi) {
const cos = Math.cos;
const sin = Math.sin;

return [ // x,y,z
r * cos(theta) * sin(phi),
r * sin(theta) * sin(phi),
r * cos(phi)
];
} // toPolar
