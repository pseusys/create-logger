// Arrays section.

/**
 * Function comparing two arrays (all elements) with standard equality function (==).
 * @param a first array.
 * @param b second array.
 * @returns whether arrays are equal or not.
 */
export function areArraysEqual<T> (a: T[], b: T[]): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

/**
 * Function getting elements that are contained by both arrays (checked with standard equality function (==)).
 * @param a first array.
 * @param b second array.
 * @returns array of elements.
 */
export function getSameElements<T> (a: T[], b: T[]): T[] {
    if (areArraysEqual(a, b)) return a;
    return [...a].filter((value: T): boolean => { return b.includes(value); });
}



// Strings section.

/**
 * Function to replace a part of base string between two indexes with other string.
 * @param str base string.
 * @param start beginning of replacement area.
 * @param end end of replacement area.
 * @param what string to be inserted.
 * @returns result string.
 */
export function replace_between (str: string, start: number, end: number, what: string): string {
    return str.substring(0, start) + what + str.substring(end);
}
