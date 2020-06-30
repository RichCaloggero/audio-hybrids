class Multiband {
constructor (input, bandCount = 3, order = 1) {
this.band = [];
this.output = [];
this.context = input.context;
if (!this.context) {
throw new Error("Multiband: input must be an audio node which is currently participating in an audio context");
} // if

for (let i=0; i < bandCount; i++) {
if (i === 0) this.band[i] = _createBand("lowshelf");
else if (i === bandCount-1) this.band[i] = _createBand("highshelf");
else this.band[i] = _createBand("peaking");
} // for

_createBand (type) {
const band = {type: type};
if (type === "lowshelf") {
band.lp = createFilters(context, "lowpass", order);
} else if (type === "highshelf") {
band.hp = createFilters(context, "highpass", order);
} else {
band.lp = createFilters(context, "lowpass", order);
band.hp = createFilters(context, "highpass", order);
} // if

band.setLow = function (frequency) {if (this.lp) this.lp.set(frequency);};
band.setHigh = function (frequency) {if(this.hp) this.hp.set(frequency);};
return band;
} // createBand

} // constructor

setCutoffs (frequencies) {

} // setCutoffs

} // class Multiband


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
