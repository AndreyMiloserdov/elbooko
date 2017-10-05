// Creates a hot reloading development environment
/* eslint no-console: "off" */

require('colors');
const fs = require('fs');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const ip = require('my-local-ip')();
//const FormData = require('form-data');
//const bodyParser = require('body-parser');
//const multipart = require('connect-multiparty');

const detectPort = require('detect-port');
const config = require('./webpack.config.dev');

const app = express();
const compiler = webpack(config);

const DEFAULT_PORT = 3000;

const btoa = function btoa(str) {
  return Buffer.from(str).toString('base64');
};

const filterJson = function filterJson(item) {
  return item.indexOf('.json') > -1;
};

const mapSetToModel = function mapSetToModel(set, inx) {
  const name = set.split('.')[0]
  
  return {
    dir: name,
    num: name.split('-')[1]
  };
};

const sendApp = function sendApp(req, res) {
  console.log(req.path, req.url);
  res.sendFile(path.resolve(__dirname, './src/cards.html'));
};

const sendSets = function sendSets(req, res) {
  fs.readdir('./resources', (err, list) => {
    const sets = (err ? [] : list)
      .filter(filterJson)
      .map(mapSetToModel);

    res.send('window.list = ' + JSON.stringify(sets));
  });
};

const hookStream = function hookStream(stream, data, cb) {
  const oldWrite = stream.write;

  // New stream write with our shiny function
  stream.write = (...args) => {
    // Old behaviour
    oldWrite.apply(stream, args);
    // Hook
    if (args[0].match(data)) {
      cb();
    }
  };
};

const sendIndex = function sendIndex(req, res) {
  res.sendFile(path.resolve(__dirname, './src/index.html'));
};

const sendSelectedSet = function sendSelectedSet(req, res) {
  const url = req.path.split('/');
  
  if (url.length === 4) {
    res.sendFile(path.resolve(__dirname, './resources/' + url.pop()));
  }

  if (url.length === 5) {
    const audio = '/' + url.pop() + '.mp3';

    res.sendFile(path.resolve(__dirname, './resources/' + url.pop() + audio));
  }

  if (url.length === 6 && url[4] === 'image') {
    const image = '/' + url[5];

    res.sendFile(path.resolve(__dirname, './resources/' + url[3] + image));
  }
};

const createStats = function createStats(file, done) {
  fs.writeFile(file, '{}', 'utf8', (err) => {
    if (err) {
      console.log('WTF, cant create stats as ' + file);
    } else {
      done();
    }
  })
}

const sendSetStats = function sendSetStats(req, res) {
  const url = req.path.split('/');
  const file = path.resolve(__dirname, './stats/' + url[3] + '.json');

  const sendStats = () => {
    res.sendFile(file);
  };

  fs.stat(file, (err, stats) => {
    if (err) {
      createStats(file, sendStats);
    } else {
      sendStats();
    }
  })
};

const saveSetStats = function saveSetStats(req, res) {
  let record = '';
  const url = req.path.split('/');
  const activity = url[4];
  const file = path.resolve(__dirname, './stats/' + url[3] + '.json');

  req.on('data', (chunk) => {
    record += chunk.toString('utf8');
  });

  req.on('end', () => {
    fs.readFile(file, 'utf8', (err, data) => {
      const stats = JSON.parse(data.toString('utf8'));
      console.log('sssss', record);
      const rec = JSON.parse(record);
      
      if (!stats[activity]) {
        stats[activity] = [];
      }

      stats[activity].push(rec);

      fs.writeFile(file, JSON.stringify(stats), 'utf8', (err) => {
        if (err) {
          res.send(false);
          console.log('WTF, cant save stats data:');
          console.log(data);
          console.log(' > to ');
          console.log(file);
        } else {
          res.send(true);
        }
      });
    });
  });
};

const runServer = function runServer(localip, freeport) {
  const address = ('http://' + localip + ':' + freeport).underline.green;

  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath,
    stats: {
      colors: true
    },
    historyApiFallback: true
  }));

  app.use(require('webpack-hot-middleware')(compiler));
  //app.use(bodyParser.urlencoded({ extended: true }));
  //app.use(bodyParser.json());
  //app.use(multipart());

  // proxy for https
  app.get('/', sendIndex);
  app.get('/cards', sendApp);
  app.get('/rest/sets', sendSets);
  app.get('/rest/sets/*', sendSelectedSet);
  app.get('/rest/stats/*', sendSetStats);
  app.post('/rest/stats/*', saveSetStats);

  app.listen(freeport, localip, (err) => {
    if (err) {
      console.log(err);

      return;
    }

    console.log('Listening at', address);

    hookStream(process.stdout, 'webpack built', () => {
      console.log('Running at', address);
    });
  });
};

const findFreePort = function findFreePort(port, callback) {
  detectPort(port, (err, freeport) => {
    if (err) {
      findFreePort(port++, callback);
    } else {
      callback(freeport);
    }
  });
};

findFreePort(DEFAULT_PORT, (freeport) => runServer(ip, freeport));
