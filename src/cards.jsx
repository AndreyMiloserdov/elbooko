import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import Cards from './containers/Cards';
import store from './containers/Cards/store';

const initCards = function init() {
  const holder = document.querySelector('[role="main"]');

  ReactDOM.render(<Provider store={store}><Cards/></Provider>, holder);

  if (module.hot) { // react-hot-reload
    module.hot.accept('./containers/Cards', () => {
      ReactDOM.render(<AppContainer><Provider store={store}><Cards/></Provider></AppContainer>, holder);
    });
  }
};

document.addEventListener('DOMContentLoaded', initCards);
