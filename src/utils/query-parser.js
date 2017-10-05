export default function buildActions(str) {
  const params = decodeURIComponent(str).substring(1).split('&');
  const result = {};

  for (let len = params.length, i = 0, param; i < len; i++) {
    param = params[i].split('=');
    result[param[0]] = param[1];
  }

  return result;
}
