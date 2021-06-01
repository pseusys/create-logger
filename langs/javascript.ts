import { InEntry } from "../core/converter";
import { class_to_CSS, Settings } from "../core/langs";



export default function construct (str: InEntry[][], set: Settings): string {
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const warning = "// Following functions work in DOM environment only. For Node.js analogues see 'TypeScript'."
    return `${warning}\n\n${codes.join("\n\n")}`;
}



const WHITESPACE = " ";
const INTENT = "\u00A0\u00A0\u00A0\u00A0";

function escape (str: string, separate: boolean = false): string {
    let res = str.replace(/\\033/g, '\\u001b').replace(/"/g, '\\"').replace(/'/g, '\\');
    if (separate) res = `"${res}"`;
    return res;
}



function create_function_for_line (entries: InEntry[], iter: number): string {
    const declaration = entries.map((value: InEntry): string => {
        if (!!value.var_name) return value.var_name;
        else return "";
    }).filter((value: string): boolean => {
        return !!value;
    });

    const sample = [];
    const code = [];
    const CSSes = [];
    entries.forEach((value: InEntry): void => {
        const css = value.classes.map((value: string): string => {
            return class_to_CSS(value);
        }).join("; ");
        CSSes.push(escape(css, true));
        if (!!value.var_name) {
            code.push(`"%c" + ${value.var_name}`);
            sample.push(`[${value.var_name}]`);
        } else {
            code.push(escape(`%c${value.value}`, true));
            sample.push(value.value);
        }
    });

    return `/**\n${WHITESPACE}* Function writing "${sample.join("")}" to console.\n${WHITESPACE}**/\n` +
        `function print${iter}thLine (${declaration.join(", ")}) {\n` +
        `${INTENT}console.log(${code.join(" + ")}, ${CSSes.join(", ")});\n` +
        `}`;
}
