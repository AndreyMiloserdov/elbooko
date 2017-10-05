import './LevelRewards.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class LevelRewards extends Component {
  static propTypes = {
    spentTime: PropTypes.number.isRequired,
    attemptsFailured: PropTypes.number.isRequired,
    hasNextLevel: PropTypes.bool.isRequired,
    onComplete: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired
  }

  _getTime() {
    let time = (this.props.spentTime / 1000).toFixed(1); // secs
    let units = 'sec';

    return time + ' ' + units;
  }

  _getStars() {
    const failured = this.props.attemptsFailured;
    let rewards;

    if (failured === 0) {
      rewards = '\u2605 \u2605 \u2605';
    } else
    if (failured < 0.5) {
      rewards = '\u2605 \u2605 \u2606';
    } else {
      rewards = '\u2605 \u2606 \u2606';
    }

    return rewards;
  }

  _nextLevelButton() {
    return (
      <div>
        <button className="feedback" onClick={this.props.onComplete}>
          Следующий уровень!
        </button>
        <br/>
        <button className="reset" onClick={this.props.onReset}>
          Пройти еще разок! ☼
        </button>
      </div>
    );
  }

  _finalScreen() {
    return (
      <div className="feedback">
        Поздравляю! Ты прошла все уровни :)
      </div>
    );
  }

  render() {
    const time = this._getTime();

    return (
      <div className="screen level-rewards">
        <div className="stats-time">Spent time {this._getTime()}</div>
        <div className="stats-stars">{this._getStars()}</div>
        {
          this.props.hasNextLevel
            ? this._nextLevelButton()
            : this._finalScreen()
        }
      </div>
    );
  }
}

export default LevelRewards;
