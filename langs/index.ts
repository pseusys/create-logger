import * as javascript from "./javascript"

export const LANGUAGES = {
    javascript: javascript.construct
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
