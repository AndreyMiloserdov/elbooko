import './Finish.scss';

import PropTypes from 'prop-types';
import React, { Component } from 'react';

class Finish extends Component {
  static propTypes = {
    model: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    onComplete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {

    };

    this.actions = {
      
    };
  }

  componentWillMount() {

  }

  render() {
    return (
      <div className="screen Finish">
        Молодец! ты изучила {this.props.model.items.length} слов
        <button>Изучить другие слова</button>
        <button>Выбрать другой набор</button>
      </div>
    );
  }
}

export default Finish;
