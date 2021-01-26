import {
    CLASS_CODES, DEFAULTS, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, ESCAPE_TERMINATE, getPostfix, getPrefix
} from "../consts/constants";

export interface Entry {
    classes: Array<string>;
    value: string;
}



function classesToStyles(classes: Array<string>): Array<string> {
    const styles = [];
    for (const cls of classes) {
        if (DEFAULTS[getPrefix(cls)] == getPostfix(cls)) continue;
        styles.push(CLASS_CODES[cls]);
    }
    return styles;
}

function sameClasses(a: Array<string>, b: Array<string>): boolean {
    if ((a == null) || (b == null)) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function convert(str: Array<Entry>): string {
    let result = "";
    let previousClasses = [];
    for (const entry of str) {
        const styles = classesToStyles(entry.classes);
        let interior = "";
        if (!sameClasses(previousClasses, styles)) {
            if (previousClasses.length > 0) interior += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
            interior += ESCAPE_START;
            interior += styles.join(ESCAPE_SEPARATOR);
            interior += ESCAPE_END;
        }
        interior += entry.value;
        result += interior;
        previousClasses = styles;
    }
    if (previousClasses.length > 0) result += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
    return result;
}
