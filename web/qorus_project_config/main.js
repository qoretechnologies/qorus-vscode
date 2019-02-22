import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Root } from './Root';

require('./project_config.html');
require('./project_config.scss');

ReactDOM.render(
    <Root />,
    document.querySelector('#root')
);
