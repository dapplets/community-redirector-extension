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

export class Popup extends React.Component<Props, State> {

    constructor(p) {
        super(p);

        this.state = {
            isLoading: true
        }
    }


    render() {

        return <div>Popup</div>;
    }
}
