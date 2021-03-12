import { RedirectInfo, map } from './model';

export function add(key: Uint8Array, target: string, message:string): void {
    const value = map.get(key, [])!;
    value.push(new RedirectInfo(target,message));
    map.set(key, value);
}

export function get(key: Uint8Array): RedirectInfo[] {
    return map.get(key, [])!;
}