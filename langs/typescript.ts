import {Entry} from "../core/constants";
import {TYPES} from "../core/langs";
import {convert} from "../core/converter";


export default function construct (str: Entry[][]): string {
    const codes = str.map((current: Entry[], index: number) => {
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

function create_function_for_line (entries: Entry[], iter: number): string {
    const declaration = entries.map((value: Entry): string => {
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
    entries.forEach((value: Entry): void => {
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
