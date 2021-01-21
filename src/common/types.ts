export type Redirection = {
    from_hash: string;
    to_url: string;
    message: string;
}

export type TabState = {
    url: string;
    tabId: number;
    disabled: boolean;
    redirections: Redirection[];
    notice: string;
};

export enum PopupType {
    POPUP = 'popup',
    WINDOW = 'window'
}