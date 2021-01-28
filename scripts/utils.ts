export function areArraysEqual<T> (a: Array<T>, b: Array<T>): boolean {
    if ((a == null) || (b == null)) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function getSameElements<T> (a: Array<T>, b: Array<T>): Array<T> {
    return [...a].filter((value: T): boolean => { return b.includes(value); });
}
