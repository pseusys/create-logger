export function areArraysEqual (a: Array<any>, b: Array<any>): boolean {
    if ((a == null) || (b == null)) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}
