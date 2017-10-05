import shuffle from './shuffle';

export default function(item, set, num) {
  const list = shuffle(set.slice(0));
  const variants = [ item ];
  let counter = 1;
  let variant, i;

  while (counter < num) {
    for (i = list.length; i--;) {
      variant = list[i];
      
      if (variant.eng === item.eng) {
        continue;
      } else {
        list.splice(i, 1);
        variants.push(variant);
        break;
      }
    }

    counter += 1;
  }

  return shuffle(variants);
}
