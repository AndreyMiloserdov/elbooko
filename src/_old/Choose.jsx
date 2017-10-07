import './Choose.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import shuffle from '../utils/shuffle';

class Choose extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      items: [],
      cardInx: 0,
      isCardsEmpty: false,
      cards: this.props.model.cards.slice(0)
    };

    this.actions = {
      cardAdd: this._cardAdd.bind(this),
      cardSkip: this._cardSkip.bind(this),
      finishScreen: this._finishScreen.bind(this)
    };
  }

  conponentWillUpdate(props) {
    console.log(props.model.cards.length);
  }

  _cardAdd() {
    const cards =  this.state.cards.slice(0);
    const items = this.state.items.slice(0);
    const cardInx = this.state.cardInx;
    const state = { cards, items };
    const card = cards[cardInx];

    items.push(card);
    cards.splice(cardInx, 1);

    if (cards.length === 0) {
      state.isCardsEmpty = true;
    }
    
    this.setState(state);
  }

  _cardSkip() {
    let cardInx = this.state.cardInx + 1;
    let cards = this.state.cards;

    if (cardInx === cards.length) {
      cardInx = 0;
    }

    this.setState({
      cardInx
    });
  }

  _finishScreen() {
    this.props.actions.initItems(this.state.items);
    this.props.onComplete();
  }

  render() {
    if (module.hot) {
      window.console.log('ARP state: ', this.state.items);
      window.console.log('ARP state: ', this.state.cards);
    }

    const card = this.state.cards[this.state.cardInx] || {};
    const style = { display: this.state.isCardsEmpty ? 'none' : '' };
    const canStartPlay = this.state.isCardsEmpty || this.state.items.length >= this.props.model.itemsMin;
    const styleFin = { display: canStartPlay ? '' : 'none' };
    const cardStyle = { display: this.state.cards.length ? '' : 'none' };
console.log(card);
    return (
      <div className="screen choose">
        <div
          style={cardStyle}
          className="card-eng">{card.eng}</div>
        <div
          style={cardStyle}
          className="card-rus">{card.rus}</div>
        <input
          type="button"
          style={style}
          value="Добавить"
          onClick={this.actions.cardAdd}/>
        <input
          type="button"
          style={style}
          value="Пропустить"
          onClick={this.actions.cardSkip}/>
        <input
          type="button"
          style={styleFin}
          value="Начать изучение"
          onClick={this.actions.finishScreen}/>
      </div>
    );
  }
}

export default Choose;
