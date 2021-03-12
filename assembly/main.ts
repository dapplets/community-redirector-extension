import { RedirectInfo, map, keys } from './model';

export function add(key: Uint8Array, target: string, message: string): void {
    const value = map.get(key, [])!;
    value.push(new RedirectInfo(target, message));
    if (!map.contains(key)) keys.push(key)
    map.set(key, value)
}

export function get(key: Uint8Array): RedirectInfo[] {
    return map.get(key, [])!;
}

export function clear():void {
    while(keys.length > 0) {
        let key = keys.pop()
        map.delete(key)
    }
}