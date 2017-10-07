import './LevelRewards.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import rest from '../services/rest';

const STAR_FILLED = '\u2605';
const STAR_EMPTY = '\u2606';

class LevelRewards extends Component {
  static propTypes = {
    setName: PropTypes.string.isRequired,
    actName: PropTypes.string.isRequired,
    spentTime: PropTypes.number.isRequired,
    attemptsFailured: PropTypes.number.isRequired,
    hasNextLevel: PropTypes.bool.isRequired,
    onComplete: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired
  }

  componentDidMount() {
    const p = this.props;
    
    rest.saveSetStats(p.setName, p.actName, {
      spentTime: p.spentTime,
      attemptsFailured: p.attemptsFailured
    });
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
      rewards = [STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_FILLED];
    } else
    if (failured <= 0.2) {
      rewards = [STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_EMPTY];
    } else
    if (failured <= 0.4) {
      rewards = [STAR_FILLED, STAR_FILLED, STAR_FILLED, STAR_EMPTY, STAR_EMPTY];
    } else
    if (failured <= 0.6) {
      rewards = [STAR_FILLED, STAR_FILLED, STAR_EMPTY, STAR_EMPTY, STAR_EMPTY];
    } else
    if (failured <= 0.8) {
      rewards = [STAR_FILLED, STAR_EMPTY, STAR_EMPTY, STAR_EMPTY, STAR_EMPTY];
    }

    return rewards.join('');
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
      <div>
        <button className="reset" onClick={this.props.onReset}>
          Пройти еще разок! ☼
        </button>
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
