import { InEntry } from "./converter";
import { getPostfix, getPrefix, multiplePrefix } from "./constants";

import typescript from "../langs/typescript";
import javascript from "../langs/javascript";



/**
 * Functions, connecting browser part of app with business part of app.
 * These should be provided with different implementations in Node env and in browser env.
 * + `log` - function to log information by language plugins, logs with toasts in browser and with console in Node.
 * + `get` - function to get settings for language plugins, gets from local storage in browser and from env vars in Node.
 */
let log, get;
if (typeof window != 'undefined') {
    log = require("../scripts/logger").log;
    get = require("../scripts/storer").get;
} else {
    log = console.log;
    get = <T> (key: string, def: string): string | null => {
        return JSON.parse(process.env[key]) ?? def;
    };
}



/**
 * Types, available for typing variables, each language plugin has its own implementation of them.
 */
export const TYPES = {
    int: "Integer",
    float: "Floating point number",
    char: "Character",
    string: "String",
    int_array: "Array of integers",
    string_array: "Array of strings"
}

/**
 * Default export type of language plugins, connection point between them and this module.
 * + `act` - function, used to generate code. It accepts array of lines (arrays) of styled with spans strings and settings.
 * + `arg` - description of arguments, accepted by this language plugin, null if no arguments available.
 */
type Constructor = { act: (str: InEntry[][], set: Settings) => Generic, arg: string };

/**
 * Language plugins, mapped to language display names.
 */
export const LANGUAGES = {
    "TypeScript (Node.js)": typescript as Constructor,
    "JavaScript (DOM)": javascript as Constructor
}

/**
 * Language plugin, set by default, if none is saved in user local storage.
 */
export const DEF_LANG = Object.keys(LANGUAGES)[0];



/**
 * Interface, representing settings, accepted by language plugin.
 * + `readable` - the only default setting, available for all plugins. Whether generated code should be easily-readable for user.
 * This is: more comments, values exported to constants, long variable names, etc.
 * + `args` - array of key-value pairs, representing keys and values, passed to plugin.
 * E.g.: -key1 value1 -key2 -key3 value3 ...
 */
export interface Settings {
    readable: boolean;
    args: { key: string, value: string }[];
}

/**
 * Interface, representing value, generated by language plugin.
 * + `code` - generated code.
 * + `formatting` - array of key-value pairs, representing color styling of the code.
 * Format is a regexp to which css string will be applied (if not intersected).
 * @see code intersected regexps
 */
export interface Generic {
    code: string;
    formatting: { format: RegExp, css: string }[];
}

/**
 * Wrapper function for `log`, has strict signature, can be used in language plugins (interop).
 * @see log log function
 * @param message string to be logged.
 */
export function toast (message: string) {
    log(message);
}

/**
 * Function, converting classes to css-strings, can be used in language plugins (interop) for languages or platforms that prefer css output over console.
 * @see CLASS_CODES classes
 * @param cls class
 * @returns css string.
 */
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



/**
 * Function to get description of arguments, accepted by the language plugin, referred to by string.
 * @see Constructor description of arguments
 * @param language which language to get args description for.
 * @returns description of arguments.
 */
export function info (language: string): string {
    return LANGUAGES[language].arg;
}

/**
 * Function to generate code in given language for given formatted lines.
 * @see Constructor arrays of styled with spans strings
 * @see Generic generated code and formatting
 * @param language language to generate code in.
 * @param str lines (arrays) of styled with spans strings.
 * @returns generated code and formatting.
 */
export function construct (language: string, str: InEntry[][]): Generic {
    const args: { key: string, value: string }[] = [];
    get("code-args-input", "").split(' ').forEach((value: string, index: number, arr: string[]) => {
        if (value.startsWith('-')) {
            const val = arr[index + 1];
            if (!!val && (!val.startsWith('-'))) args.push({ key: value.substring(1), value: val });
            else args.push({ key: value.substring(1), value: null });
        }
    });
    return LANGUAGES[language].act(str, { readable: get("readable-check", true), args: args } as Settings);
}
