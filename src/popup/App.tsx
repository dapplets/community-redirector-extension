import * as React from "react";
import { Popup } from './Popup';
import { Window } from './Window';

interface Props {
  type: string;
}

interface State {
}

export class App extends React.Component<Props, State> {
  render() {
    const { type } = this.props;

    if (type === 'popup') return <Popup />;
    if (type === 'window') return <Window />;
    return null;
  }
}
