import { LANGUAGES, TYPES } from "./langs"
import { LITERALS, TRANSLATIONS } from "./babylon";



export const SEPARATOR = '-';

export const COLORS = {
    black: "0",
    red: "1",
    green: "2",
    yellow: "3",
    blue: "4",
    magenta: "5",
    cyan: "6",
    white: "7"
}

export const STYLES = {
    bold: "1",
    normal: "22",
    dim: "2"
}

export const DEFAULTS = {
    for: "white",
    back: "black",
    sty: "normal"
}



// These below are not exported to PUG or LESS as they are keys for specific classes:
export const PREFIXES = {
    for: "3",
    back: "4",
    sty: "",
    blink: "5",
    cross: "9",
    under: "4",
    ita: "3"
}

export const VAR_NAMES = {
    "var-name": "data-var-name",
    "var-type": "data-var-type"
}



export function getPrefix (cls) {
    if (cls.includes(SEPARATOR)) return cls.split(SEPARATOR)[0];
    else return cls;
}

export function getPostfix (cls) {
    if (cls.includes(SEPARATOR)) return cls.split(SEPARATOR)[1];
    else return "";
}



export function multiplePrefix (pref) {
    return (pref === 'for') || (pref === 'back') || (pref === 'sty');
}



function generateClassCodes () {
    const codes = {};
    for (const prefix in PREFIXES) {
        if ((prefix === 'for') || (prefix === 'back'))
            for (const color in COLORS)
                codes[prefix + SEPARATOR + color] = PREFIXES[prefix] + COLORS[color];
        else if (prefix === 'sty')
            for (const styles in STYLES)
                codes[prefix + SEPARATOR + styles] = PREFIXES[prefix] + STYLES[styles];
        else codes[prefix] = PREFIXES[prefix];
    }
    return codes;
}

export const CLASS_CODES = generateClassCodes();



export interface Entry {
    classes: string[];
    value: string;
    var_name?: string;
    var_type?: string;
}



// For passing variables to LESS:

export const LESS_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES)
};

Object.keys(DEFAULTS).forEach((value) => {
    LESS_VARS["def-" + value] = DEFAULTS[value];
});



// For passing variables to PUG:

export const PUG_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES),

    languages: LANGUAGES,
    types: TYPES,

    literals: LITERALS,
    translations: TRANSLATIONS
};
