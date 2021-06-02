import { CLASS_CODES, DEFAULTS, getPostfix, getPrefix } from "./constants";
import { areArraysEqual, reduce } from "./utils";

export const ESCAPE_START = "\\u001b[";
export const ESCAPE_SEPARATOR = ";";
export const ESCAPE_END = "m";
export const ESCAPE_TERMINATE = "0";



export interface InEntry {
    classes: string[];
    value: string;
    var_name?: string;
    var_type?: string;
}

export interface OutEntry {
    prefix: number[];
    value: string;
    is_var:  boolean;
}



function classes_to_style_codes (classes: string[]): number[] {
    const styles: number[] = [];
    for (const cls of classes) {
        if (!Object.keys(CLASS_CODES).includes(cls)) continue;
        if (DEFAULTS[getPrefix(cls)] == getPostfix(cls)) continue;
        styles.push(CLASS_CODES[cls]);
    }
    return styles;
}

export function convert(str: InEntry[], useVarNames: boolean = false): OutEntry[] {
    return str.map((value: InEntry): OutEntry => {
        const styles = classes_to_style_codes(value.classes);
        const interior: OutEntry = { prefix: [], value: "", is_var: false };
        interior.prefix.push(...styles);
        interior.value += (useVarNames && !!value.var_name) ? value.var_name : value.value;
        interior.is_var = !!value.var_name;
        return interior;
    });
}
