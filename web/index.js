import '@babel/polyfill';
import React from 'react';
import { render } from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import AppContainer from './App';
import reducer from './reducers';
import { vscode } from './common/vscode';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import 'normalize.css/normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/datetime/lib/css/blueprint-datetime.css';
import '@blueprintjs/table/lib/css/table.css';

require('./index.html');
require('./webview.scss');

const store = createStore(reducer);
store.subscribe(() => {
    //    console.log('store.getState(): ' + JSON.stringify(store.getState(), null, 4));
    vscode.setState(store.getState());
});

render(
    <DndProvider backend={HTML5Backend}>
        <Provider store={store}>
            <AppContainer />
        </Provider>
    </DndProvider>,
    document.querySelector('#root')
);
