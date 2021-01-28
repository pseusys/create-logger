import { CLASS_CODES, DEFAULTS, getPostfix, getPrefix } from "../consts/constants";
import { areArraysEqual } from "./utils";

export interface Entry {
    classes: Array<string>;
    value: string;
}

export const ESCAPE_START = "\\033[";
export const ESCAPE_SEPARATOR = ";";
export const ESCAPE_END = "m";
export const ESCAPE_TERMINATE = "0";



function classesToStyles(classes: Array<string>): Array<string> {
    const styles = [];
    for (const cls of classes) {
        if (DEFAULTS[getPrefix(cls)] == getPostfix(cls)) continue;
        styles.push(CLASS_CODES[cls]);
    }
    return styles;
}

export function convert(str: Array<Entry>): string {
    let result = "";
    let previousClasses = [];
    for (const entry of str) {
        const styles = classesToStyles(entry.classes);
        let interior = "";
        if (!areArraysEqual(previousClasses, styles)) {
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
