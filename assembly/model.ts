import { PersistentMap } from "near-sdk-as";

@nearBindgen
export class RedirectInfo {
    constructor(public targetURL: string, public message: string) { }
}

export const map = new PersistentMap<Uint8Array, RedirectInfo[]>("mm");