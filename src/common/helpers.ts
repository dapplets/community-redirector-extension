export function debounce(callback: Function, delay: number) {
    let timeout;
    return function (...args: any[]) {
        clearTimeout(timeout);
        timeout = setTimeout(callback.bind({}, ...args), delay);
    }
}