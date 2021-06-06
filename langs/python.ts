import { TYPES, Settings, toast, Generic, varify } from "../core/langs";
import { convert, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, ESCAPE_TERMINATE, InEntry, OutEntry } from "../core/converter";
import { CLASS_CODES } from "../core/constants";



// Settings variable.
let readable = true;

// Function to generate a special function, used for generation more easily-read code.
function gen_read () {
    const start = `${ESCAPE_START}{'${ESCAPE_SEPARATOR}'.join([str(code) for code in list(codes)])}${ESCAPE_END}`;
    const end = `${ESCAPE_START}${ESCAPE_TERMINATE}${ESCAPE_END}`;
    return 'def _style(string: str, *codes: int)-> str:\n' +
        '\t"""\n' +
        '\tFunction styling string with given codes.\n' +
        '\tstring -- string to be styled.\n' +
        '\t*codes -- ASCII code to be applied to string.\n' +
        '\treturns styled string.\n' +
        '\t"""\n' +
        `\treturn f"${start}{string}${end}"`;
}

// Main function, constructing the code.
function construct (str: InEntry[][], set: Settings): Generic {
    readable = set.readable;
    if (set.args.length > 0) toast('Settings unexpected!');
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const read = readable ? Object.keys(constants).map((value: string): string => {
        return `${varify(value)} = ${constants[value]}`
    }).join('\n') + `\n\n\n${gen_read()}\n\n\n` : "";
    return { code: `${read}${codes.join("\n\n")}`, formatting: CODE_STYLE };
}



// Implementation of common types for typescript.
function type (type: string): string {
    switch (type) {
        case TYPES.int:
            return 'int';
        case TYPES.float:
            return 'float';
        case TYPES.char:
        case TYPES.string:
            return 'str';
        case TYPES.int_array:
            return 'list[int]';
        case TYPES.string_array:
            return 'list[str]';
    }
}

// Use "\s" instead of whitespaces and tabs.
const CODE_STYLE = [
    { format: /def|return/g, css: 'color: GoldenRod' },
    { format: /(?<=:\s?|->\s?)(?:int|float|str|list\[int]|list\[str])/g, css: 'color: GoldenRod' },
    { format: /[0-9]*/g, css: 'color: CornflowerBlue' },

    { format: /(?<=def).*(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /(?<=\.).*?(?=\([\s\S]*\))/g, css: 'color: Gold' },

    { format: /f"(?=.*")|(?<=f".*)"/g, css: 'color: SeaGreen' },
    { format: /(?<=\{).*?(?=})/g, css: 'font-weight: 700' },
    { format: /\\u[0-9]+b\[.*?m/g, css: 'color: Khaki; font-weight: 700' },

    { format: /#.*/g, css: 'color: Silver' },
    { format: /"""[\s\S]*?"""/g, css: 'color: SeaGreen' }
];



// Function to escape quotes in string and wrap string itself in quotes if needed.
function escape (str: string, qot: string): string {
    let res = str.replace(/"/g, '\\"').replace(/'/g, "\\'");
    res = !!qot ? (res.replace(/\{/g, "{{").replace(/}/g, "}}")) : res;
    res = !!qot ? (qot + res + qot) : res;
    return res;
}

// Variables for human-readable code.
const constants = {};

// Code and comment are generated at the same time.
function create_function_for_line (entries: InEntry[], iter: number): string {
    if (readable) entries.forEach((entry: InEntry) => {
        entry.classes.forEach((value: string) => {
            constants[value] = CLASS_CODES[value];
        });
    });

    const declaration = entries.map((value: InEntry): string => {
        let currentVar = "";
        if (!!value.var_name) {
            let currentVarType = type(value.var_type);
            currentVar += value.var_name + ((!!currentVarType) ? (': ' + currentVarType) : "");
        }
        return currentVar;
    }).filter((value: string): boolean => {
        return !!value;
    });

    const sample: string[] = [];
    const code: string[] = [];
    convert(entries, true).forEach((value: OutEntry) => {
        const prefix = (value.prefix.length > 0) ? `${ESCAPE_START}${value.prefix.join(ESCAPE_SEPARATOR)}${ESCAPE_END}` : "";
        const postfix = (value.prefix.length > 0) ? (ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END) : "";
        const prefixes = readable ? value.prefix.map((num: number): string => {
            return varify(Object.keys(constants).find((value: string): boolean => {
                return constants[value] == num;
            }));
        }) : [];
        if (value.is_var) {
            if (readable && (value.prefix.length > 0)) code.push(`{_style(${value.value}, ${prefixes.join(', ')})}`);
            else code.push(`${prefix}{${value.value}}${postfix}`);
            sample.push(`[${value.value}]`);
        } else {
            if (readable && (value.prefix.length > 0)) code.push(`{_style(${escape(value.value, "'")}, ${prefixes.join(', ')})}`);
            else code.push(`${prefix}${escape(value.value, "")}${postfix}`);
            sample.push(value.value);
        }
    });

    return `def print${iter}thLine(${declaration.join(", ")}):\n` +
        `\t""" Function writing "${sample.join("")}" to console. """\n` +
        `\tprint(f"${code.join("")}")\n`;
}



export default { act: construct, arg: null };
