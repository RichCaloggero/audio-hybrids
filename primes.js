export function primes (a, b) {
return integers(a, b)
.filter(isPrime);
} // primes


export function isPrime (n) {
if (n >= 1 && n <= 3) return true;
if (isEven(n)) return false;

return integers(3, Math.floor(Math.sqrt(n)))
.filter(isOdd)
.every(x => n%x !== 0);
} // isPrime

export function integers (a, b) {
const results = [];
for (let i=Math.min(a,b); i <= Math.max(a,b); i++) results.push(i);
return results;
} // integers

export function isEven (n) {return n%2 === 0;}
export function isOdd (n) {return !isEven(n);}
