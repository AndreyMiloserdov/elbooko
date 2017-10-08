import random from './random';

const MAX_ITERATIONS = 5000;

export default function(model, num) {
  const state = model.map(() => false);
  const max = model.length - 1;
  let total = num;
  let i = 0;
  let inx;

  if (num > model.length) {
    throw 'Wrong num for state of symbols (' + num + '), when max is ' + model.length;
  }

  if (num === model.length) {
    return model.map(() => true);
  }

  while (total > 0) {
    if (++i === MAX_ITERATIONS) {
      console.log(num, model);
      throw 'Ups... max iteration exceeded';
    }

    do {
      inx = random(max);
    } while (
      state[inx] === true
        ||
      model[inx].used == model[inx].max
    );

    state[inx] = true;
    total -= 1;
  }

  return state;
}
