import { LANGUAGES, TYPES } from "./langs"
import { LITERALS, TRANSLATIONS } from "./babylon";

export const ESCAPE_START = "\\033[";
export const ESCAPE_SEPARATOR = ";";
export const ESCAPE_END = "m";
export const ESCAPE_TERMINATE = "0";



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



export const PREFIXES = {
    for: "3",
    back: "4",
    sty: "",
    blink: "5",
    cross: "9",
    under: "4",
    ita: "3"
}



export function getPrefix (cls) {
    if (cls.includes(SEPARATOR)) return cls.split(SEPARATOR)[0];
    else return "";
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



// For passing variables to LESS:

export const LESS_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES),
    bold: "700",
    normal: "400",
    dim: "100"
};



// For passing variables to PUG:

interface Param {
    var: string;
    name: string;
}

function capitalize (arr: Array<string>): Array<Param> {
    const array = [];
    for (const str of arr) array.push({ var: str, name: str[0].toUpperCase() + str.substr(1) });
    return array;
}

export const PUG_VARS = {
    prefixes: {
        "for-color": "for",
        "back-color": "back",
        style: "sty",
        simple: capitalize(["blink", "cross", "under", "ita"])
    },
    colors: capitalize(Object.keys(COLORS)),
    styles: capitalize(Object.keys(STYLES)),

    languages: LANGUAGES,
    types: TYPES,

    literals: LITERALS,
    translations: TRANSLATIONS
};
