import * as React from "react";
import { Core } from "../background/core";
import { PopupType, TabState } from "../common/types";
import { Redirections } from './Redirections';
import { NoRedirections } from './NoRedirections';

interface Props {
  type: PopupType;
  core: Core;
}

interface State {
  isLoading: boolean;
  tabState: TabState;
}

export class App extends React.Component<Props, State> {

  constructor(p) {
    super(p);
    this.state = {
      isLoading: true,
      tabState: null
    };
  }

  async componentDidMount() {
    const tabState = await this.props.core.getCurrentTabState();
    this.setState({
      isLoading: false,
      tabState
    })
  }

  render() {
    const p = this.props,
      s = this.state;

    if (s.isLoading) return null;

    if (s.tabState.redirections.length === 0) {
      return <NoRedirections tabState={s.tabState}/>;
    } else {
      return <Redirections tabState={s.tabState} core={p.core} type={p.type} />;
    }
  }
}
