import shuffle from './shuffle';

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export default function(word, extra) {
  const symbols = shuffle(word.split(''));
  
  if (extra === 0) {
    return symbols;
  }

  const alphabet = shuffle(ALPHABET.split(''));

  while (extra > 0) {
    symbols.push(alphabet.shift());
    extra -= 1;
  }

  return shuffle(symbols);
}
