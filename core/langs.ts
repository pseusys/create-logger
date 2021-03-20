import typescript from "../langs/typescript"
import {Entry} from "./constants";


export const TYPES = {
    int: "Integer",
    float: "Floating point number",
    char: "Character",
    string: "String",
    int_array: "Array of integers",
    string_array: "Array of strings"
}

export const LANGUAGES = {
    "TypeScript (Node.js)": typescript,
    "JavaScript (DOM)": typescript
}



export function construct (language: string, str: Entry[][]): string {
    return LANGUAGES[language](str);
}
