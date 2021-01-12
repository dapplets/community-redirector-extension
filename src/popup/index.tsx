import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';

const url = new URL(window.location.href);
const type = url.searchParams.get('type');

ReactDOM.render(<App type={type} />, document.querySelector('#app'));