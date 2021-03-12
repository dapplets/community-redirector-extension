import { PersistentMap, PersistentVector } from "near-sdk-as";

@nearBindgen
export class RedirectInfo {
    constructor(public targetURL: string, public message: string) { }
}

export const map = new PersistentMap<Uint8Array, RedirectInfo[]>("mm");
export const keys = new PersistentVector<Uint8Array>("mm");