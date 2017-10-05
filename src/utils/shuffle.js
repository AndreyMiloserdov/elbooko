const shuffle = function shuffle(a) {
  for (let i = a.length; i; i--) {
    let j = Math.floor(Math.random() * i);
    [a[i - 1], a[j]] = [a[j], a[i - 1]];
  }

  return a;
};

shuffle.complex = function comp(a, num) {
  const total = a.length * num;
  const result = [];
  let last1 = null;
  let last2 = null;
  let item = null;
  const lib = {};

  while (resule.length < total) {
    do {

    } while (false);
  }  

  return result;
};


export default shuffle;
