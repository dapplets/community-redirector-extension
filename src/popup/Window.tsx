import * as React from "react";
import { browser } from "webextension-polyfill-ts";

interface Props {
}

interface State {
  isLoading: boolean;
  notice?: string;
  from?: string;
  to?: string;
  message?: string;
}

export class Window extends React.Component<Props, State> {

  private sendResponse: (data: any) => void = null;

  constructor(p) {
    super(p);

    this.state = {
      isLoading: true
    }
  }

  componentDidMount() {
    browser.runtime.sendMessage('ready');
    browser.runtime.onMessage.addListener((request, sender) => {
      if (request.from && request.to) {
        this.setState({
          from: request.from,
          to: request.to,
          message: request.message,
          notice: request.notice,
          isLoading: false
        });

        return new Promise((res, rej) => this.sendResponse = (data: any) => res(data));
      }
    });
  }

  componentWillUnmount() {
    this.sendResponse(undefined);
  }

  redirect() {
    this.sendResponse('redirect');
    window.close();
  }

  ignore() {
    this.sendResponse('ignore');
    window.close();
  }

  render() {
    const s = this.state,
      p = this.props;

    if (s.isLoading) return null;

    return <div>
      <p>{s.notice}</p>

      <b>Redirection found</b>
      <p>From: {s.from}</p>
      <p>To: {s.to}</p>
      <p>Message: {s.message}</p>

      <button onClick={() => this.redirect()}>Redirect</button>
      <button onClick={() => this.ignore()}>Ignore</button>
    </div>;
  }
}
