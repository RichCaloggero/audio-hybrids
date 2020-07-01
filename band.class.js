class FrequencyBand {
constructor (input, freq,  order = 1) {
this.input = input;
this.order = order;
const context = input.context;
this.context = context;

if (!context) {
throw new Error("Multiband: input must be an audio node which is currently participating in an audio context");
} // if

if (freq.low && freq.high) {
this.band = _createBand("peaking");
} else if (freq.low) {
this.band = _createBand("lowshelf");
else if(freq.high) {
this.band = _createBand("highshelf");
} // if

this.output = context.createGain();
this.input.connect(this.band.input);
this.band.output.connect(this.output);

function _createBand (type) {
const band = {type: type, output: context.createGain()};
if (type === "lowshelf") {
band.lp = createFilters(context, "lowpass", order);
input.connect(band.lp.input);
band.lp.output.connect(band.output);
} else if (type === "highshelf") {
band.hp = createFilters(context, "highpass", order);
input.connect(band.hp.input);
band.hp.output.connect(band.output);
} else {
band.lp = createFilters(context, "lowpass", order);
band.hp = createFilters(context, "highpass", order);
input.connect(band.hp.input);
band.lp.output.connect(band.output);
} // if

band.setLow = function (frequency) {if (this.lp) this.lp.set(Number(frequency));};
band.setHigh = function (frequency) {if(this.hp) this.hp.set(Number(frequency));};
band.setGain = function (value) {this.output.gain.value = Number(value);};
return band;
} // createBand

} // constructor

set low (value) {this.band.setLow(value);}
set high (value) {this.band.setHigh(value);}
set gain (value) {this.band.setGain(value);}
} // class FrequencyBand


function createFilters (context, type, count) {
const filters = [];
for (let i=0; i<count; i++) {
filters[i] = context.createBiquadFilter();
filters[i].type = type;
} // for

for (let i=0; i<count-1; i++) {
filters[i].connect(filters[i+1]);
} // for

return {
input: filters[0], output: filters[count-1], filters: filters,
set: function (frequency) {this.filters.forEach(f => f.frequency.value = frequency);}
};
} // createFilters
