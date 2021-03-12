import * as React from "react";
import { Core } from "../background/core";
import NEAR_ICON from "./near.svg";

interface Props {
    core: Core;
}

interface State {
    accountId: string | null;
    loading: boolean;
}

export class LoginBar extends React.Component<Props, State> {

  constructor(p: Props) {
    super(p);

    this.state = {
        accountId: null,
        loading: true
    };
  }

  async componentDidMount() {
    const account = await this.props.core.getCurrentAccount();

    this.setState({
        loading: false,
        accountId: account ? account.accountId : null
    });
  }

  async _signIn() {
    await this.props.core.signIn();
  }

  async _signOut() {
    await this.props.core.signOut();
    const account = await this.props.core.getCurrentAccount();
    this.setState({  accountId: account ? account.accountId : null });
  }

  render() {
    const s = this.state;

    if (s.loading) return null;

    if (s.accountId) {
        return <div className="loginBar">
            <div style={{ flex: '1', lineHeight: '32px' }}>
              <img style={{ position: 'relative', top: '7px' }} src={NEAR_ICON} width='24px' />
              NEAR Wallet: <a href={`https://explorer.testnet.near.org/accounts/${s.accountId}`} target='_blank'>{s.accountId}</a>
            </div>
            <button style={{ width: '100px' }} onClick={() => this._signOut()} className='button button_basic button_color_blue'>Sign Out</button>
        </div>;
    } else {
        return <div className="loginBar">
            <div style={{ flex: '1', lineHeight: '32px' }}>
              <img style={{ position: 'relative', top: '7px' }} src={NEAR_ICON} width='24px' />
              NEAR Wallet: No account
            </div>
            <button style={{ width: '100px' }} onClick={() => this._signIn()} className='button button_color_blue'>Sign In</button>
        </div>;
    }
  }
}
