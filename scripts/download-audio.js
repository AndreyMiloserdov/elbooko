const fs = require('fs');
const http = require('http');
const async = require('async');
const fse = require('fs-extra');
const colors = require('colors');
const DomParser = require('dom-parser');

const timerStart = Date.now();
const parser = new DomParser();
let words = process.argv.slice(3);
var options = {
  host: 'http://dictionary.cambridge.org',
  path: '/ru/' + encodeURI('словарь/английский') + '/',
  method: 'GET',
  headers: {
    'Content-Type': 'html/text'
  }
};
const outputName = process.argv[2];
const destFolder = './resources/' + outputName;

const getIndex = function(word) {
  const inx = ++word.inx;
  return '-' + (inx > 10 ? inx : '0' + inx);
};

const filterUndefined = function(val) {
  return !!val;
};

const mapMP3links = function(node, inx) {
  return node.getAttribute('data-src-mp3');
};

const mapWordsOnModel = function(arr, done) {
  console.log(111, arr);
  words = arr;
  done();
}

const onError = function(err) {
  console.log(colors.red('Error:' + err.message));
  console.log(err);
};

const onFinish = function() {
  const secs = (Date.now() - timerStart) / 1000;
  const mins = secs > 60 ? secs / 60 : NaN;
  const time = isNaN(mins) ? secs : mins;
  const str = isNaN(mins) ? 'secs' : 'mins';

  console.log(colors.green('Finished: ' + words.length), time + ' ' + str);
};

const getAudioLinks = function(word, done) {
  const req = http.get(options.host + options.path + word, (res) => {
    let htmlPage = '';
    res.setEncoding('utf8');

    res.on('error', function (err) {
      console.log(word + ':' + res.statusCode);
      console.log(err);
      done();
    });

    res.on('data', function (chunk) {
      htmlPage += chunk;
    });

    res.on('end', function() {
      const html = parser.parseFromString(htmlPage);
      const prons = html.getElementsByClassName('audio_play_button')
        .map(mapMP3links)
        .filter(filterUndefined);

      done(null, {
        inx: 0,
        name: word,
        links: new Set(prons)
      });
    });
  });

  req.end();
};

const saveMp3File = function(word, link, done) {
  const req = http.get(link, (res) => {
    const name = word.name + getIndex(word) + '.mp3';
    const path = destFolder + '/' + name;
    const file = fs.createWriteStream(path);

    res.pipe(file);

    res.on('error', function (err) {
      fs.unlink(path); // Delete the file async. (But we don't check the result)
      done(err);
    });

    res.on('finish', function() {
      file.close(done);
    });
  });

  req.end();
};

const saveMp3Files = function(word, done) {
  async.each(word.links, (link, next) => saveMp3File(word, link, next), done);
};

async.waterfall([
  (done) => async.map(words, getAudioLinks, (err, arr) => mapWordsOnModel(arr, done)),
  (done) => fse.ensureDir(destFolder, () => done()),
  (done) => async.each(words, saveMp3Files, done),
  onFinish
], onError);