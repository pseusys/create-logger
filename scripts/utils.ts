export function areArraysEqual<T> (a: T[], b: T[]): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function getSameElements<T> (a: T[], b: T[]): T[] {
    if (areArraysEqual(a, b)) return a;
    return [...a].filter((value: T): boolean => { return b.includes(value); });
}
