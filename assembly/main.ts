import { PersistentMap } from 'near-sdk-core';

const map = new PersistentMap<Uint8Array, string[]>("m");

export function add(key: Uint8Array, path: string): void {
    const value = map.get(key, [])!;
    value.push(path);
    map.set(key, value);
}

export function get(key: Uint8Array): string[] {
    return map.get(key, [])!;
}