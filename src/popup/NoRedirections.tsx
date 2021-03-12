import * as React from "react";
import { TabState } from "../common/types";

interface Props {
  tabState: TabState;
}

interface State {
}

export class NoRedirections extends React.Component<Props, State> {

  constructor(p) {
    super(p);

    this.state = {
    }
  }

  render() {
    const p = this.props;

    return <div>
      {(!!p.tabState.notice && p.tabState.notice.length > 0) ? <p className='message'>{p.tabState.notice}</p> : null}

      <p>
        There is no redirect for<br />
        <span className='popup__link'>{p.tabState.url}</span>
      </p>

      <p>
        You can create your own redirect in our <span className='popup__link' onClick={() => window.open('https://github.com/dapplets/community-redirector-registry', '_blank')}>GitHub repository</span>
      </p>
    </div>
  }
}
