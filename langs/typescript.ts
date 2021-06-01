import {TYPES, Settings, toast} from "../core/langs";
import { convert, InEntry } from "../core/converter";


export default function construct (str: InEntry[][], set: Settings): string {
    console.log(set)
    toast(JSON.stringify(set));
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const warning = "// Following functions work in Node.js environment only. For DOM analogues see 'JavaScript'."
    return `${warning}\n\n${codes.join("\n\n")}`;
}



const WHITESPACE = "\u00A0";
const INTENT = "\u00A0\u00A0\u00A0\u00A0";

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



//TODO: extract escape sequences from code (maybe general func)
function extract_escapes () {

}

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

    const sample = [];
    const code = [];
    entries.forEach((value: InEntry): void => {
        const str = convert([value], true);
        if (!!value.var_name) {
            code.push(`\$\{${value.var_name}\}`);
            sample.push(`[${value.var_name}]`);
        } else {
            code.push(str);
            sample.push(value.value);
        }
    });

    return `/**\n${WHITESPACE}* Function writing "${sample.join("")}" to console.\n${WHITESPACE}**/\n` +
        `export function print${iter}thLine (${declaration.join(", ")}) {\n` +
        `${INTENT}console.log(\`${code.join("")}\`);\n` +
        `}`;
}
