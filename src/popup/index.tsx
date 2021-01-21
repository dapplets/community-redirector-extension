import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './App';
import { Core } from '../background/core';
import { PopupType } from '../common/types';
import './style.scss';

const url = new URL(window.location.href);
const type: PopupType = url.searchParams.get('type') as PopupType;
const core: Core = chrome.extension.getBackgroundPage()['core'];

ReactDOM.render(<App type={type} core={core}/>, document.querySelector('#app'));