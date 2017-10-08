import './LabelPicture.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import PlayAudio from './PlayAudio';
import shuffle from '../utils/shuffle';
import buildVariants from '../utils/build-variants';

const BTTN_TEXT = {
  USUAL: 'Правильно! Следующее слово...',
  FINAL: 'Праивльно! Все слова пройдены!'
};

class LabelPicture extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired,
    variants: PropTypes.number,
    instanceTimestamp: PropTypes.number.isRequired,
    mode: PropTypes.string.isRequired
  }

  static TYPE = 'label-picture';
  static NAME = 'Перевод с картинки';

  constructor(props) {
    super(props);

    this.cardsFailured = [];
    this.attemptsOverall = 0;
    this.attemptsFailured = 0;
    this.timeStarted = Date.now();
    this.variantsNum = this.props.variants || 2;

    this.state = this._newInstance(this.props.model.cards);

    this.actions = {
      nextCard: this._nextCard.bind(this)
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.instanceTimestamp !== this.props.instanceTimestamp) {
      this._refresh();
    }
  }

  _refresh() {
    this.cardsFailured = [];
    this.attemptsOverall = 0;
    this.attemptsFailured = 0;
    this.timeStarted = Date.now();

    this.setState(this._newInstance(this.props.model.cards));
  }

  _newInstance(cardsToUse) {
    const cardInx = 0;
    const bttnText = BTTN_TEXT.USUAL;
    const cards = shuffle(cardsToUse.slice(0));
    const variants = this._getVariants(cards[cardInx]);

    this.cardsFailured.length = 0;
    this.attemptsOverall += this.variantsNum * cards.length;

    return {
      cards,
      variants,
      cardInx,
      bttnText,
      cardsFailured: [],
      showFeedback: false,
      variantsDisabled: variants.map(() => false)
    };
  }

  _checkAnswer(correct, inx) {
    const isLast = this.state.cardInx === this.state.cards.length - 1;
    const variantsDisabled = this.state.variantsDisabled.slice(0);
    const state = {variantsDisabled};
    const cf = this.cardsFailured;

    variantsDisabled[inx] = true;

    if (correct) {
      state.showFeedback = true;
      state.bttnText = isLast ? BTTN_TEXT.FINAL : BTTN_TEXT.USUAL;
    } else {
      if (cf.indexOf(inx) === -1) {
        cf.push(inx);
      }

      this.attemptsFailured += 1;
    }

    this.setState(state);
  }

  _getVariants(card) {
    return buildVariants(card, this.props.model.cards, this.variantsNum);
  }

  _nextCard() {
    const nextSet = [];
    const failured = this.cardsFailured;
    const cardInx = this.state.cardInx + 1;
    const cards = this.state.cards.slice(0);

    if (cardInx === cards.length) {
      if (failured.length) {
        if (failured.length === 1) {
          const fail = cards[failured[0]];
          let card;
          
          do {
            card = cards.shift();
          } while (card === fail);

          nextSet.push(card);
          nextSet.push(fail);
        } else {
          for (let i = failured.length; i--;) {
            nextSet.push(cards[failured[i]]);
          }
        }

        this.setState(this._newInstance(nextSet));
      } else {
        this.props.onComplete({
          spentTime: Date.now() - this.timeStarted,
          attemptsFailured: this.attemptsFailured / this.attemptsOverall
        });
      }
    } else {
      const variants = this._getVariants(this.state.cards[cardInx]);

      this.setState({
        cardInx,
        variants,
        showFeedback: false,
        variantsDisabled: variants.map(() => false)
      });
    }
  }

  _getRewards() {
    const half = this.attemptsOverall / 2;
    let rewards = 0;

    if (this.attemptsFailured === 0) {
      rewards = 3;
    } else
    if (this.attemptsFailured < half) {
      rewards = 2;
    } else {
      rewards = 1;
    }

    return rewards;
  }

  _renderPic(card) {
    return (
      <div className="picture">
        <img src={card.image}/>
      </div>
    );
  }

  _renderWord(word) {
    return (
      <div className="target-word">
        {word}
      </div>
    );
  }

  render() {
    const vd = this.state.variantsDisabled;
    const card = this.state.cards[this.state.cardInx];
    const choicesClass = (this.state.showFeedback ? ' finished' : '');
    const feedbackProps = {
      style: {
        opacity: this.state.showFeedback ? 1 : 0
      }
    };
    const mode = this.props.mode.split('=>');
    const from = mode[0];
    const to = mode[1];

    return (
      <div className="screen label-picture">
        <div>
          {
            (from === 'pic')
            ? this._renderPic(card)
            : this._renderWord(card[from])
          }
          <div className={'choices' + choicesClass}>
            {
              this.state.variants.map(
                (item, inx) => (
                  <button
                    key={inx}
                    disabled={vd[inx]}
                    className={item.eng === card.eng ? 'correct' : 'wrong'}
                    onClick={() => this._checkAnswer(item.eng === card.eng, inx)}>
                    {
                      item[to]
                    }
                  </button>
                )
              )
            }
          </div>
          <div className="feedback" {...feedbackProps}>
            <button
              disabled={!this.state.showFeedback}
              onClick={() => this._nextCard(true)}
            >Правильно! Следующее слово...</button>
          </div>
        </div>
      </div>
    );
  }
}

export default LabelPicture;
