import { CLASS_CODES, DEFAULTS, getPostfix, getPrefix } from "./constants";



/**
 * Constants, used for styling strings in ASCII, common parts of all escape sequence.
 * Escape sequence template: ESCAPE_START + num1 + ESCAPE_SEPARATOR [+ num2 + ESCAPE_SEPARATOR + ...] + ESCAPE_END + 'string' + ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
 * Numbers num1, num2, are referred to as ASCII escape numbers.
 */
export const ESCAPE_START = "\\u001b[";
export const ESCAPE_SEPARATOR = ";";
export const ESCAPE_END = "m";
export const ESCAPE_TERMINATE = "0";



/**
 * Interface, representing formatted with span string:
 * + `classes` - classes, styling the string.
 * + `value` - the string itself.
 * + `var_name` - name of variable, associated with the string (optional).
 * + `var_type` - type of variable, associated with the string (optional, only if var_name is set).
 * @see CLASS_CODES classes
 */
export interface InEntry {
    classes: string[];
    value: string;
    var_name?: string;
    var_type?: string;
}

/**
 * Interface, representing ASCII formatted string:
 * + `prefix` - array of ascii escape numbers.
 * + `value` - the string itself.
 * + `is_var` - whether this is a variable or not.
 * @see ESCAPE_SEPARATOR ASCII escape numbers
 */
export interface OutEntry {
    prefix: number[];
    value: string;
    is_var:  boolean;
}



/**
 * Function, converting classes of span-formatted string to ASCII escape numbers.
 * @see ESCAPE_SEPARATOR ASCII escape numbers
 * @see CLASS_CODES classes
 * @param classes classes of span-formatted string.
 * @returns ASCII escape numbers.
 */
function classes_to_style_codes (classes: string[]): number[] {
    const styles: number[] = [];
    for (const cls of classes) {
        if (!Object.keys(CLASS_CODES).includes(cls)) continue;
        if (DEFAULTS[getPrefix(cls)] == getPostfix(cls)) continue;
        styles.push(CLASS_CODES[cls]);
    }
    return styles;
}

/**
 * Function to convert array of span-formatted strings to array of ASCII formatted strings.
 * @param str array of span-formatted strings.
 * @param use_var_names whether variable names should be used in output instead of string values or not.
 * @returns array of ASCII formatted strings.
 */
export function convert(str: InEntry[], use_var_names: boolean = false): OutEntry[] {
    return str.map((value: InEntry): OutEntry => {
        const styles = classes_to_style_codes(value.classes);
        const interior: OutEntry = { prefix: [], value: "", is_var: false };
        interior.prefix.push(...styles);
        interior.value += (use_var_names && !!value.var_name) ? value.var_name : value.value;
        interior.is_var = !!value.var_name;
        return interior;
    });
}
