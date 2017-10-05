import 'babel-polyfill';
import './Cards.scss';

import PropTypes from 'prop-types';
import rest from '../services/rest';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import * as serviceActions from './Cards/actions';

import LevelRewards from '../components/LevelRewards';
import Loading from '../components/Loading';
import KeepInMind from '../components/KeepInMind';
import LabelPicture from '../components/LabelPicture';
import ListenAndFind from '../components/ListenAndFind';
import Choose from '../components/Choose';
import Translate from '../components/Translate';
import FITB from '../components/FITB';

const SCREENS = [
  {
    view: Loading
  },
  {
    view: KeepInMind
  },
  {
    view: LabelPicture,
    showRewards: true,
    props: {
      variants: 3
    }
  },
  {
    view: ListenAndFind,
    showRewards: true,
    props: {
      variants: 3
    }
  },
  {
    view: FITB,
    showRewards: true,
  }
];

@connect((state) => ({ state }))

class Cards extends Component {
  static propTypes = {
    state: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      screen: 0,
      result: null,
      isScreen: true
    };

    this.setName = '';

    this.actions = {
      showNextScreen: this._showNextScreen.bind(this),
      resetThisScreen: this._resetThisScreen.bind(this),
      serviceActions: bindActionCreators(serviceActions, this.props.dispatch)
    };

    const commonProps = {
      model: this.props.state,
      actions: this.actions.serviceActions,
      onComplete: this.actions.showNextScreen
    };
  }

  componentWillMount() {
    const setName = location.search.substr(1);
    const file = setName + '.json';

    this.setName = setName;

    rest
      .getSetData()
      .then((set) => this._initData(set))
      .catch((err) => this._errorData(err));
  }

  _initData(data) {
    const { name, set, stats } = data;

    this.actions.serviceActions.init(name, set, stats);
    this.actions.showNextScreen(true);
  }

  _errorData(err) {
    console.log(err);
  }

  _resetThisScreen() {
    console.log(222, this.state.isScreen);
    
    this.setState({
      isScreen: true
    });
  }

  _showNextScreen(result) {
    const screen = SCREENS[this.state.screen];
    const state = {
      ...this.state,
      result: result || null
    };

    if (screen.showRewards) {
      state.isScreen = !state.isScreen;

      if (state.isScreen) {
        state.screen += 1;
      }

      setTimeout(() => {
        this.setState(state);
      }, 100);
    } else {
      state.screen += 1;

      setTimeout(() => {
        this.setState(state);
      }, 1000);
    }
  }

  render() {
    if (module.hot) {
      window.console.log('ARP state: ', this.props.state);
    }

    const screen = SCREENS[this.state.screen];
    const Screen = screen.view;
    const props = screen.props || {};
    const result = this.state.result || {};
    const screenProps = {
      model: this.props.state,
      actions: this.actions.serviceActions,
      onComplete: this.actions.showNextScreen,
      ...props
    };
    const rewardsProps = {
      spentTime: result.spentTime,
      attemptsFailured: result.attemptsFailured,
      onComplete: this.actions.showNextScreen,
      onReset: this.actions.resetThisScreen,
      hasNextLevel: this.state.screen < SCREENS.length - 1
    };

    return (
      <div className="elbooko app-cards">
        {
          this.state.isScreen
            ? <Screen {...screenProps}/>
            : <LevelRewards {...rewardsProps}/>
        }
      </div>
    );
  }
}

export default Cards;
