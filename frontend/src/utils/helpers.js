export const round2 = (num) => Math.round(num * 100 + Number.EPSILON) / 100; // 123.2345 => 123.23
//export const round2 = (num) => Math.round(num * 100) / 100; // round2 function to round to 2 decimal places
