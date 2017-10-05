import random from './random';

export default function(input, num) {
  const symbols = input.map((s) => false);
  const max = input.length - 1;
  let total = num;
  let inx;

  if (num > input.length) {
    throw 'Wrong num for state of symbols (' + num + '), when max is ' + input.length;
  }

  if (num === input.length) {
    return input.map((s) => true);
  }

  while (total > 0) {
    do {
      inx = random(max);
    } while (symbols[inx] === true);

    symbols[inx] = true;
    total -= 1;
  }

  return symbols;
}
