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

export function reduce<T, U> (array: T[], callback: (value: T, collect: U) => U): U[] {
    const result: U[] = [];
    let collect: U = null;
    for (const elem of array) {
        collect = callback(elem, collect);
        result.push(collect);
    }
    return result;
}



export function replace_between (str: string, start: number, end: number, what: string): string {
    return str.substring(0, start) + what + str.substring(end);
}
