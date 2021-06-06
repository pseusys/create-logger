// Example plugin for typescript code generation. Only key things will be documented.

import { TYPES, Settings, toast, Generic, varify } from "../core/langs";
import { convert, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, ESCAPE_TERMINATE, InEntry, OutEntry } from "../core/converter";
import { CLASS_CODES } from "../core/constants";



// Settings variable.
let readable = true;

// Function to generate a special function, used for generation more easily-read code.
function gen_read () {
    const start = `${ESCAPE_START}\${codes.join('${ESCAPE_SEPARATOR}')}${ESCAPE_END}`;
    const end = `${ESCAPE_START}${ESCAPE_TERMINATE}${ESCAPE_END}`;
    return "/**\n" +
        " * Function styling _string_ with given _codes_.\n" +
        " * @param str string to be styled.\n" +
        " * @param codes ASCII codes to be applied to str.\n" +
        " * @return styled string.\n" +
        "**/\n" +
        "function style (str: string, ...codes: number[]): string {\n" +
        `\treturn \`${start}\${str}${end}\`;\n` +
        "}";
}

// Main function, constructing the code.
function construct (str: InEntry[][], set: Settings): Generic {
    readable = set.readable;
    if (set.args.length > 0) toast('Settings unexpected!');
    const warning = "// Following functions work in Node.js environment only. For DOM analogues see 'JavaScript'."
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const read = readable ? Object.keys(constants).map((value: string): string => {
        return `const ${varify(value)} = ${constants[value]};`
    }).join('\n') + `\n\n${gen_read()}\n\n` : "";
    return { code: `${warning}\n\n${read}${codes.join("\n\n")}`, formatting: CODE_STYLE };
}



// Implementation of common types for typescript.
function type (tp: string): string {
    switch (tp) {
        case TYPES.int:
        case TYPES.float:
            return 'number';
        case TYPES.char:
        case TYPES.string:
            return 'string';
        case TYPES.int_array:
            return 'number[]';
        case TYPES.string_array:
            return 'string[]';
    }
}

// Color styling is always constant, so color styling is represented by constant array.
const CODE_STYLE = [
    { format: /const|let|function|return|export/g, css: 'color: GoldenRod' },
    { format: /number(?:\[\])?|string(?:\[\])?/g, css: 'color: GoldenRod' },

    { format: /console|document|window/g, css: 'color: DarkMagenta; font-weight: 700; font-style: italic' },
    { format: /[0-9]*(?=;\n)/g, css: 'color: CornflowerBlue' },

    { format: /(?<=function).*(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /(?<=\.).*?(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /;(?=\n)/g, css: 'color: Gold' },

    { format: /`/g, css: 'color: SeaGreen' },
    { format: /(?<=\$\{).*?(?=\})/g, css: 'font-weight: 700' },
    { format: /\\u[0-9]+b\[.*?m/g, css: 'color: Khaki; font-weight: 700' },

    { format: /\/\/.*/g, css: 'color: Silver' },
    { format: /\/\*\*[\s\S]*?\*\*\//g, css: 'color: SeaGreen' }
];



// Function to escape quotes in string and wrap string itself in quotes if needed.
function escape (str: string): string {
    return str.replace(/"/g, '\\"').replace(/'/g, "\\'");
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
            let currentVarType = value.var_type ?? 'any';
            currentVarType = type(currentVarType) ?? currentVarType;
            currentVar += `${value.var_name}: '${currentVarType}`;
        }
        return currentVar;
    }).filter((value: string): boolean => {
        return !!value;
    });

    const sample: string[] = [];
    const code: string[] = [];
    convert(entries, true).forEach((value: OutEntry) => {
        const prefix = (value.prefix.length > 0) ? `${ESCAPE_START}${value.prefix.join(ESCAPE_SEPARATOR)}${ESCAPE_END}` : "";
        const postfix = (value.prefix.length > 0) ? `${ESCAPE_START}${ESCAPE_TERMINATE}${ESCAPE_END}` : "";
        const prefixes = readable ? value.prefix.map((num: number): string => {
            return varify(Object.keys(constants).find((val: string): boolean => {
                return constants[val] == num;
            }));
        }) : [];
        if (value.is_var) {
            if (readable && (value.prefix.length > 0)) code.push(`\${style(${value.value}, ${prefixes.join(', ')})}`);
            else code.push(`${prefix}\$\{${value.value}\}${postfix}`);
            sample.push(`[${value.value}]`);
        } else {
            if (readable && (value.prefix.length > 0)) code.push(`\${style('${escape(value.value)}', ${prefixes.join(', ')})}`);
            else code.push(`${prefix}${value.value}${postfix}`);
            sample.push(value.value);
        }
    });

    return `/**\n * Function writing "${sample.join("")}" to console.\n **/\n` +
           `export function print${iter}thLine (${declaration.join(", ")}) {\n` +
           `\tconsole.log(\`${code.join("")}\`);\n` +
           `}\n`;
}


// Default export by plugin - Generic instance.
export default { act: construct, arg: null };
