import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Root } from './Root';

require('./delete_interfaces.html');
require('./delete_interfaces.scss');

ReactDOM.render(
    <Root />,
    document.querySelector('#root')
);
