import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import { Root } from './Root';

require('./index.html');
require('./release_package.scss');

ReactDOM.render(
    <Root />,
    document.querySelector('#root')
);
