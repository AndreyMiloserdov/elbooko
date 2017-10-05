import types from './types';

export const init = function init(name, cards, stats) {
  return {
    type: types.INIT,
    stats,
    cards,
    name
  };
};

