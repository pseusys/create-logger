import {CLASS_CODES, DEFAULTS, Entry, getPostfix, getPrefix} from "./constants";
import { areArraysEqual } from "./utils";

export const ESCAPE_START = "\\033[";
export const ESCAPE_SEPARATOR = ";";
export const ESCAPE_END = "m";
export const ESCAPE_TERMINATE = "0";



//TODO: Reverse for file reading.
function classesToStyles(classes: string[]): string[] {
    const styles: string[] = [];
    for (const cls of classes) {
        if (!Object.keys(CLASS_CODES).includes(cls)) continue;
        if (DEFAULTS[getPrefix(cls)] == getPostfix(cls)) continue;
        styles.push(CLASS_CODES[cls]);
    }
    return styles;
}

// TODO: add option to use user var names
export function convert(str: Entry[], useVarNames: boolean = false): string {
    let result = "";
    let previousClasses: string[] = [];
    for (const entry of str) {
        const styles = classesToStyles(entry.classes);
        let interior = "";
        if (!areArraysEqual(previousClasses, styles)) {
            if (previousClasses.length > 0) interior += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
            if (styles.length > 0) {
                interior += ESCAPE_START;
                interior += styles.join(ESCAPE_SEPARATOR);
                interior += ESCAPE_END;
            }
        }
        interior += entry.value;
        result += interior;
        previousClasses = styles;
    }
    if (previousClasses.length > 0) result += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
    return result;
}
