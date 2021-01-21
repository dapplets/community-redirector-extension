import * as React from "react";
import { browser } from "webextension-polyfill-ts";
import { Core } from "../background/core";
import { TabState, PopupType } from "../common/types";

interface Props {
  tabState: TabState;
  core: Core;
  type: PopupType;
}

interface State {
  disabled: boolean;
  hover: boolean;
}

export class Redirections extends React.Component<Props, State> {

  constructor(p: Props) {
    super(p);

    this.state = {
      disabled: p.tabState.disabled,
      hover: false
    };
  }

  redirect() {
    const p = this.props;
    const redirection = p.tabState.redirections[0];
    p.core.redirect(p.tabState.tabId, redirection.to_url);
    window.close();
  }

  disable() {
    const p = this.props;
    p.core.disableRedirections(p.tabState.url);
    if (p.type === PopupType.WINDOW) window.close();
    this.setState({ disabled: true });
  }

  enable() {
    const p = this.props;
    p.core.enableRedirections(p.tabState.url);
    if (p.type === PopupType.WINDOW) window.close();
    this.setState({ disabled: false });
  }

  render() {
    const s = this.state,
      p = this.props;

    const redirection = p.tabState.redirections[0];

    return <div>
      {(!!p.tabState.notice && p.tabState.notice.length > 0) ? <p className='message'>{p.tabState.notice}</p> : null}

      <p>There is redirect for this resource</p>

      <p>From: <span className={(!s.disabled) ? 'popup__link' : 'popup__link_disabled'} onClick={() => !s.disabled && window.close()}>{p.tabState.url}</span></p>

      <p>To: <span className={(!s.disabled) ? 'popup__link' : 'popup__link_disabled'} onClick={() => !s.disabled && this.redirect()}>{redirection.to_url}</span></p>

      {(!!redirection.message && redirection.message.length > 0) ? <p>Message: {redirection.message}</p> : null}

      <button style={{ width: '100px' }} onClick={() => this.redirect()} disabled={s.disabled} className='button button_color_blue'>Redirect</button>

      <span onMouseEnter={() => this.setState({ hover: true })} onMouseLeave={() => this.setState({ hover: false })}>
        {(s.disabled) ?
          ((s.hover) ? <button style={{ width: '100px' }} className='button button_color_red' onClick={() => this.enable()}>Activate</button> : <button style={{ width: '100px' }} className='button button_color_green button_basic'>Disabled</button>) :
          <button style={{ width: '100px' }} onClick={() => this.disable()} className='button button_color_green'>Disable</button>}
      </span>

    </div>
  }
}
