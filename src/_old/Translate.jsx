import './Translate.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PlayAudio from './PlayAudio';
import shuffle from '../utils/shuffle';
import buildVariants from '../utils/build-variants';

const FEEDBACK_TYPE = {
  NONE: 0,
  SUCCESS: 1,
  FAILURE: 2
};

class Translate extends Component {
  static propTypes = {
    mode: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired,
    showText: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.items = this._buildItems();
    this.translate = this._getMode();
  }

  componentWillMount() {
    this._getItem();
  }

  _getMode() {
    const mode = this.props.mode.split('=>');

    return {
      from: mode[0],
      to: mode[1]
    };
  }

  _buildItems() {
    return shuffle(this.props.model.items.slice(0))
      .map((item) => ({
        ...item,
        attemptsSuccess: 0,
        attemptsFailure: 0,
        isFinished: false
      }));
  }

  _getItem() {
    const len = this.items.length;
    let foundNotFinished = false;
    let item;

    for (let i = len; i--;) {
      item = this.items[i];
      
      if (item.isFinished) {
        continue;
      }

      foundNotFinished = true;
      break;
    }

    if (foundNotFinished) {
      this.setState({
        item,
        feedbackType: FEEDBACK_TYPE.NONE,
        variants: buildVariants(item, this.props.model.cards, 4)
      });
    } else {
      this.props.onComplete();
    }
  }

  _checkAnswer(correct) {
    const item = this.state.item;

    item.attemptsSuccess += correct ? 1 : 0;
    item.attemptsFailure += correct ? 0 : 1;

    this.setState({
      feedbackType: correct ? FEEDBACK_TYPE.SUCCESS : FEEDBACK_TYPE.FAILURE
    });
  }

  _nextWord(correct) {
    const item = this.state.item;

    if (correct) {
      item.isFinished = true;
      this._getItem();
    } else {
      this.setState({
        feedbackType: FEEDBACK_TYPE.NONE,
        variants: buildVariants(item, this.props.model.cards, 4)
      });
    }
  }

  render() {
    const from = this.translate.from;
    const to = this.translate.to;
    const target = this.state.item;
    const isFeedbackMode = this.state.feedbackType !== FEEDBACK_TYPE.NONE;

    const choicesStyle = {
      display: this.state.feedbackType === FEEDBACK_TYPE.NONE ? '' : 'none'
    };

    const feedbackSuccessStyle = {
      display: this.state.feedbackType === FEEDBACK_TYPE.SUCCESS ? '' : 'none'
    };

    const feedbackFailureStyle = {
      display: this.state.feedbackType === FEEDBACK_TYPE.FAILURE ? '' : 'none'
    };

    return (
      <div className="screen select-rus">
        Выбери правильный перевод
        <div>
          <PlayAudio audio={this.state.item.audio}/>
          {
            this.props.showText
              ? target[from]
              : null
          }
        </div>
        <div style={choicesStyle}>
          {
            this.state.variants.map(
              (item, inx) => (
                <button
                  key={inx}
                  onClick={() => this._checkAnswer(item.eng === target.eng)}>
                  {
                    item[to]
                  }
                </button>
              )
            )
          }
        </div>
        <div style={feedbackSuccessStyle}>
          <button onClick={() => this._nextWord(true)}>Правильно! Следующее слово...</button>
        </div>
        <div style={feedbackFailureStyle}>
          <button onClick={() => this._nextWord(false)}>Неверно! Попробуй еще раз</button>
        </div>
      </div>
    );
  }
}

export default Translate;
