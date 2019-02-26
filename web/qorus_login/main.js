import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Root } from './Root';

require('./login.html');
require('./login.scss');

ReactDOM.render(
    <Root />,
    document.querySelector('#root')
);
