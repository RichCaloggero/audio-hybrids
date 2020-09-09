export class FrequencyBand {
constructor (context, type,  order = 1) {
if (!context) {
throw new Error("FrequencyBand: context must be a valid audio context");
} // if

this.context = context;
this.input = context.createGain();
this.output = context.createGain();
this.order = order;
this.type = type;
this._low = [];
this._high = [];

if (type === "peaking") {
this._low = createFilters(context, order, "highpass", this.input, this.output);
this._high = createFilters(context, order, "lowpass", this.input, this.output);
} else if (type === "lowshelf") {
this._low = createFilters(context, order, "lowpass", this.input, this.output);
} else if(type === "highshelf") {
this._high = createFilters(context, order, "highpass", this.input, this.output);
} // if
} // constructor

set low (frequency) {this.setFrequency(this._low, frequency);}
set high (frequency) {this.setFrequency(this._high, frequency);}
set gain (gain) {this.output.gain.value = gain;}

setFrequency(filters, frequency) {filters.forEach(f => f.frequency.value = Number(frequency));}
} // class FrequencyBand


function createFilters (context, count, type,  input, output) {
const filters = [];
for (let i=0; i<count; i++) {
filters[i] = context.createBiquadFilter();
filters[i].type = type;
} // for

for (let i=0; i<count-1; i++) {
filters[i].connect(filters[i+1]);
} // for

input.connect(filters[0]);
filters[count-1].connect(output);
return filters;
} // createFilters
