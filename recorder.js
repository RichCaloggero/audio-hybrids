import * as app from "./app.js";
import * as audio from "./audio.js";


export function start () {
audio.context.audioWorklet.addModule("recorder.worklet.js")
.then(() => {
const player = app.root.querySelector("audio-player").audioElement;
const results = app.root.shadowRoot.querySelector("#recorder-results");
const destination = app.root.querySelector("audio-destination");
const data = [];
const recorder = new AudioWorkletNode(audio.context, "audio-recorder");
destination.input.connect(recorder);

recorder.port.onmessage = e => {
const message = e.data;
if (message instanceof Array) {
	data.push(message);
} else if (message === "done") {
retrieveData(data);
} else {
app.statusMessage(`unknown message: ${e.data[0]}`);
} // if
}; // onmessageHandler


const _start = () => {
recorder.port.postMessage(["started", true]);
app.statusMessage("Recording started.");
}; // _start

const _stop = () => {
recorder.port.postMessage(["done", true]);
app.statusMessage("Recording stopped.");
}; // _stop

player.addEventListener("play", _start);
player.addEventListener("pause", _stop);
player.addEventListener("ended", _stop);

app.statusMessage("Recording enabled; click play to begin...");

function retrieveData (data) {
const frameCount = sum(data.map(chunk => chunk[0].length));
const buffer = new AudioBuffer({length: frameCount, numberOfChannels: 2, sampleRate: audio.context.sampleRate});
app.statusMessage(`retrieving data: ${data.length}, chunks, ${data[0][0].length} frames per chunk, ${frameCount} frames`);

let offset = 0;
data.forEach(chunk => {
buffer.copyToChannel(chunk[0], 0, offset);
buffer.copyToChannel(chunk[1], 1, offset);
offset += chunk[0].length;
});
app.statusMessage("data copied to buffer");

results.src = URL.createObjectURL(bufferToWave(buffer, frameCount));
app.statusMessage("wave data created");

player.removeEventListener("play", _start);
player.removeEventListener("paused", _stop);
player.removeEventListener("ended", _stop);
destination.input.disconnect(recorder);

app.statusMessage("Recording complete.");
} // retrieveData
}).catch (error => app.statusMessage(`recorder: could not instantiate worker - ${error}`));

} // start

/* https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/ */

function bufferToWave (abuffer, len) {
var numOfChan = abuffer.numberOfChannels,
length = len * numOfChan * 2 + 44,
buffer = new ArrayBuffer(length),
view = new DataView(buffer),
channels = [], i, sample,
offset = 0,
pos = 0;

// write WAVE header
setUint32(0x46464952);                         // "RIFF"
setUint32(length - 8);                         // file length - 8
setUint32(0x45564157);                         // "WAVE"

setUint32(0x20746d66);                         // "fmt " chunk
setUint32(16);                                 // length = 16
setUint16(1);                                  // PCM (uncompressed)
setUint16(numOfChan);
setUint32(abuffer.sampleRate);
setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
setUint16(numOfChan * 2);                      // block-align
setUint16(16);                                 // 16-bit (hardcoded in this demo)

setUint32(0x61746164);                         // "data" - chunk
setUint32(length - pos - 4);                   // chunk length

// write interleaved data
for(i = 0; i < abuffer.numberOfChannels; i++)
channels.push(abuffer.getChannelData(i));

while(pos < length) {
for(i = 0; i < numOfChan; i++) {             // interleave channels
sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
view.setInt16(pos, sample, true);          // write 16-bit sample
pos += 2;
}
offset++                                     // next source sample
}

// create Blob
return new Blob([buffer], {type: "audio/wav"});

function setUint16(data) {
view.setUint16(pos, data, true);
pos += 2;
}

function setUint32(data) {
view.setUint32(pos, data, true);
pos += 4;
}
} // bufferToWave

function sum (a) {return a.reduce((sum, x) => sum += x, 0);}
