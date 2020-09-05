import {define, html, property} from "./hybrids/index.js";
import * as element from "./new.element.js";
import * as audio from "./audio.js";
import * as ui from "./ui.js";

const defaults = {
scale: {ui: {heading: "dimensions"}, default: 1, min: Number.MIN_VALUE, step: 0.1},
width: {default: Math.random(), min: Number.MIN_VALUE, step: 0.1},
height: {default: Math.random(), min: Number.MIN_VALUE, step: 0.1},
depth: {default: Math.random(), min: Number.MIN_VALUE, step: 0.1},

left: {ui: {heading: "materials"}, default: "transparent", type: "list", values: materials()},
right: {default: "transparent", type: "list", values: materials()},
up: {ui: {row: true}, default: "transparent", type: "list", values: materials()},
down: {default: "transparent", type: "list", values: materials()},
front: {ui: {row: true}, default: "transparent", type: "list", values: materials()},
back: {default: "transparent", type: "list", values: materials()}
}; // defaults

const Room = element.create("room", defaults, initialize, {

scale: {
set: (host, value) => _set(host, "scale", value, host._defaults["scale"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

width: {
set: (host, value) => _set(host, "width", value, host._defaults["width"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

height: {
set: (host, value) => _set(host, "height", value, host._defaults["height"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

depth: {
set: (host, value) => _set(host, "depth", value, host._defaults["depth"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

left: {
set: (host, value) => _set(host, "left", value, host._defaults["left"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

right: {
set: (host, value) => _set(host, "right", value, host._defaults["right"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

up: {
set: (host, value) => _set(host, "up", value, host._defaults["up"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

down: {
set: (host, value) => _set(host, "down", value, host._defaults["down"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

front: {
set: (host, value) => _set(host, "front", value, host._defaults["front"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

back: {
set: (host, value) => _set(host, "back", value, host._defaults["back"]),
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
//observe: (host, value) => updateRoom(host.node, host._room)
},

}); // create


Room.render = ui.createRenderer(defaults, []);


define ("audio-room", Room);



function initialize (host) {
const scene = createScene(audio.context);
const source = {};
const inLeft = source.left = scene.createSource();
const inRight = source.right = scene.createSource();
//inLeft.setDirectivityPattern(0, 100);
//inRight.setDirectivityPattern(0, 100);
const s = audio.context.createChannelSplitter();

host.input.connect(s);
s.connect(inLeft.input, 0,0);
s.connect(inRight.input, 1,0);
scene.output.connect(host.wet);

host.node = scene;
host._resonance = {source, scene};
host._room = defaultRoom();
updateRoom(host.node, host._room);
element.signalReady(host);
} // initialize


function createScene (context, order = 3) {
const scene = new ResonanceAudio(context);
scene.setAmbisonicOrder(order);
return scene;
} // createScene

function createDescriptors (keys) {
return Object.fromEntries(keys.map(key => [key, createDescriptor(key)]));
} // createDescriptors

function createDescriptor (name) {
return ({[name]: {
set: (host, value) => {
return _set(host, name, value, host._defaults[name]);
}, // set
connect: (host, key) => _set(host, key, host.getAttribute(key) || host._defaults[key].default, host._defaults[key]),
observe: (host, value) => {
//console.debug(`observe: ${host._id}, ${name}, ${value}`);
updateRoom(host.node, host._room);
} // observe
}});
} // createDescriptor

function _set (host, name, value, data) {
if (typeof(value) === "undefined") value = data.default;
value = (data.type === "number" || typeof(data.default) === "number")? Number(value) : value;
if (name === "width" || name === "height" || name === "depth") host.scale = host._room.scale = 1;

host._room[name] = value;
updateRoom(host.node, host._room);
//console.debug(`_set: ${host._id}, ${name}, ${value}`);
return value;
} // _set

function updateRoom (scene, room) {
const scale = room.scale;
room.width *= scale;
room.depth *= scale;
room.height *= scale;
const materials = {
left: room.left, right: room.right,
up: room.up, down: room.down,
front: room.front, back: room.back
};

const dimensions = {width: room.width, height: room.height, depth: room.depth};
//console.debug(`room updated: `, room);

scene.setRoomProperties(dimensions, materials);
} // updateRoom

function defaultRoom () {
return {
scale: 1,
width: 4, height: 2.2, depth: 3.1,
left: "transparent", right: "transparent",
up: "transparent", down: "transparent",
front: "transparent", back: "transparent"
}; // return
} // defaultRoom


function materials () {
return [
'transparent',
'acoustic-ceiling-tiles',
'brick-bare',
'brick-painted',
'concrete-block-coarse',
'concrete-block-painted',
'curtain-heavy',
'fiber-glass-insulation',
'glass-thin',
'glass-thick',
'grass',
'linoleum-on-concrete',
'marble',
'metal',
'parquet-on-concrete',
'plaster-smooth',
'plywood-panel',
'polished-concrete-or-tile',
'sheetrock',
'water-or-ice-surface',
'wood-ceiling',
'wood-panel',
'uniform'
]; // return
} // materials

function displayDimensions(dimensions) {
return `${dimensions.width.toFixed(2)}X${dimensions.depth.toFixed(2)}X${dimensions.height.toFixed(2)}`;
} // displayDimensions
