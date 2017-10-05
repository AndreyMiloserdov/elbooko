const getSetData = function getSetData() {
  const setName = location.search.substr(1);
  const file = setName + '.json';

  return Promise.all([
    fetch('/rest/sets/' + file)
      .then((res) => res.json()),
    fetch('/rest/stats/' + setName)
      .then((res) => res.json())
  ]).then(res => ({
    set: res[0],
    stats: res[1],
    name: setName
  }));
};

const saveSetStats = function saveStats(setName, activityType, stats) {
  return fetch('/rest/stats/' + setName + '/' + activityType, {
    method: 'post',
    body: JSON.stringify(stats),
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    }    
  });
};

export default ({
  getSetData,
  saveSetStats
});
