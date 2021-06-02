import { InEntry } from "./converter";
import { getPostfix, getPrefix, multiplePrefix } from "./constants";

let log, get;
if (typeof window != 'undefined') {
    log = require("../scripts/logger").log;
    get = require("../scripts/storer").get;
} else {
    log = console.log;
    get = <T> (key: string, def: string): string | null => {
        return process.env[key] ?? def;
    };
}

import typescript from "../langs/typescript";
import javascript from "../langs/javascript";



export const TYPES = {
    int: "Integer",
    float: "Floating point number",
    char: "Character",
    string: "String",
    int_array: "Array of integers",
    string_array: "Array of strings"
}

type Constructor = { act: (str: InEntry[][], set: Settings) => Generic, arg: string };

export const LANGUAGES = {
    "TypeScript (Node.js)": typescript as Constructor,
    "JavaScript (DOM)": javascript as Constructor
}

export const DEF_LANG = Object.keys(LANGUAGES)[0];



export interface Settings {
    readable: boolean;
    args: { key: string, value: string }[];
}

export interface Generic {
    code: string;
    formatting: { format: RegExp, css: string }[];
}

export function toast (message: string) {
    log(message);
}

export function class_to_CSS(cls: string): string {
    if (multiplePrefix(getPrefix(cls))) switch (getPrefix(cls)) {
        case ("for"): return `color: ${getPostfix(cls)}`;
        case ("back"): return `background: ${getPostfix(cls)}`;
        case ("sty"): switch (getPostfix(cls)) {
            case ("bold"): return "font-weight: 700";
            case ("normal"): return "font-weight: 400";
            case ("dim"): return "font-weight: 100";
            default: return "";
        }
        default: return "";
    } else switch (cls) {
        case ("cross"): return "text-decoration: line-through";
        case ("under"): return "border-bottom: 2px solid currentColor";
        case ("ita"): return "font-style: italic";
        default: return "";
    }
}



export function info (language: string): string {
    return LANGUAGES[language].arg;
}

export function construct (language: string, str: InEntry[][]): Generic {
    const args: { key: string, value: string }[] = [];
    get("code-args-input", "").split(' ').forEach((value: string, index: number, arr: string[]) => {
        if (value.startsWith('-')) {
            const val = arr[index + 1];
            if (!!val && (!val.startsWith('-'))) args.push({ key: value.substring(1), value: val });
            else args.push({ key: value.substring(1), value: null });
        }
    });
    return LANGUAGES[language].act(str, { readable: get("readable-check", false), args: args } as Settings);
}
