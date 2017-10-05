import types from './types';
import initialState from './state';
import shuffle from '../../utils/shuffle';

const reducers = {};

const createCard = function createCard(card, name) {
  const link = '/rest/sets/' + name + '/';
  
  return {
    eng: card.eng,
    rus: card.rus,
    image: link + 'image/' + card.eng + '.png',
    audio: card.audio.map((src) => link + src)
  }
};

reducers[types.INIT] = function initSet(state, action) {
  return {
    ...state,
    stats: action.stats,
    cards: shuffle(action.cards.map((card) => createCard(card, action.name)))
  };
};

export default function(state, action) {
  if (reducers[action.type]) {
    return reducers[action.type](state, action);
  } else
  if (state) {
    return state;
  } else {
    return initialState;
  }
}
