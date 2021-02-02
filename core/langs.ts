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
    string_array: "Array of strings"
}



export interface Part {
    classes: string[];
    value: string;
    var_name?: string;
    type?: string;
}

export function construct (language: string, str: Part[][]): string {
    return LANGUAGES[language](str);
}
