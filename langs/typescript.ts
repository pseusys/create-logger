import { TYPES, Settings, toast, Generic } from "../core/langs";
import { convert, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, InEntry, OutEntry } from "../core/converter";


export default function construct (str: InEntry[][], set: Settings): Generic {
    toast(JSON.stringify(set));
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const warning = "// Following functions work in Node.js environment only. For DOM analogues see 'JavaScript'."
    return { code: `${warning}\n\n${codes.join("\n\n")}`, formatting: CODE_STYLE };
}



function type (type: string): string {
    switch (type) {
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

const CODE_STYLE = [
    { format: /(?:function|export)/g, css: 'color: GoldenRod' },
    { format: /(?:number(?:\[\])?|string(?:\[\])?)/g, css: 'color: GoldenRod' },

    { format: /(?:console|document|window)/g, css: 'color: DarkMagenta; font-weight: 700; font-style: italic' },

    { format: /(?<=function)(?:.*)(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /(?<=\.)(?:.*)(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /;(?=\n)/g, css: 'color: Gold' },

    { format: /`/g, css: 'color: SeaGreen' },
    { format: /(?<=\$\{)(?:.*)(?=\})/g, css: 'font-weight: 700' },
    { format: /\\u[0-9]+b\[(?:[0-9];*)+m/g, css: 'color: Khaki; font-weight: 700' },

    { format: /\/\/.*/g, css: 'color: Silver' },
    { format: /\/\*\*[\s\S]*\*\*\//g, css: 'color: SeaGreen' }
];



function create_function_for_line (entries: InEntry[], iter: number): string {
    const declaration = entries.map((value: InEntry): string => {
        let currentVar = "";
        if (!!value.var_name) {
            let currentVarType = value.var_type ?? 'any';
            currentVarType = type(currentVarType) ?? currentVarType;
            currentVar += value.var_name + ': ' + currentVarType;
        }
        return currentVar;
    }).filter((value: string): boolean => {
        return !!value;
    });

    const sample: string[] = [];
    const code: string[] = [];
    convert(entries, true).forEach((value: OutEntry) => {
        const prefix = (value.prefix.length > 0) ? `${ESCAPE_START}${value.prefix.join(ESCAPE_SEPARATOR)}${ESCAPE_END}` : "";
        const postfix = (value.postfix.length > 0) ? `${ESCAPE_START}${value.postfix.join(ESCAPE_SEPARATOR)}${ESCAPE_END}` : "";
        if (value.is_var) {
            code.push(`${prefix}\$\{${value.value}\}${postfix}`);
            sample.push(`[${value.value}]`);
        } else {
            code.push(`${prefix}${value.value}${postfix}`);
            sample.push(value.value);
        }
    });

    return `/**\n * Function writing "${sample.join("")}" to console.\n **/\n` +
        `export function print${iter}thLine (${declaration.join(", ")}) {\n` +
        `\tconsole.log(\`${code.join("")}\`);\n` +
        `}`;
}
