export default function(arr) {
  const result = {};
  let val, i;

  for (i = arr.length; i--;) {
    val = arr[i];
    result[val] = val;
  }

  return result;
}
