import * as javascript from "../langs/javascript"

export const LANGUAGES = {
    javascript: javascript.construct
}

export const TYPES = {
    int: "Integer",
    float: "Floating point number",
    char: "Character",
    string: "String",
    int_array: "Array of integers",
    string_array: "Array strings"
}



export interface Part {
    classes: Array<string>;
    value: string;
    var_name?: string;
    type?: string;
}

export function construct (language: string, str: Array<Array<Part>>): string {
    return LANGUAGES[language](str);
}
