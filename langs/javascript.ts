import {Entry, getPostfix, getPrefix, multiplePrefix} from "../core/constants";



export default function construct (str: Entry[][]): string {
    const codes = str.map((current: Entry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const warning = "// Following functions work in DOM environment only. For Node.js analogues see 'TypeScript'."
    return `${warning}\n\n${codes.join("\n\n")}`;
}



const WHITESPACE = "\u00A0";
const INTENT = "\u00A0\u00A0\u00A0\u00A0";

function escape (str: string, separate: boolean = false): string {
    let res = str.replace(/\\033/g, '\\u001b').replace(/"/g, '\\"').replace(/'/g, '\\');
    if (separate) res = `"${res}"`;
    return res;
}



function class_to_CSS(cls: string): string {
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
        case ("cross"): return "text-decoration: line-through;";
        case ("under"): return "border-bottom: 2px solid currentColor;";
        case ("ita"): return "font-style: italic;";
        default: return "";
    }
}



//TODO: extract escape sequences from code (maybe general func)
function extract_escapes () {

}

function create_function_for_line (entries: Entry[], iter: number): string {
    const declaration = entries.map((value: Entry): string => {
        if (!!value.var_name) return value.var_name;
        else return "";
    }).filter((value: string): boolean => {
        return !!value;
    });

    const sample = [];
    const code = [];
    const CSSes = [];
    entries.forEach((value: Entry): void => {
        const css = value.classes.map((value: string): string => {
            return class_to_CSS(value);
        }).join("; ");
        CSSes.push(escape(css, true));
        if (!!value.var_name) {
            /*
            const divided = str.split(value.value);
            code.push(escape(divided[0], true));
            code.push(escape(value.var_name, false));
            code.push(escape(divided[1], true));
            */
            code.push(`"%c" + ${value.var_name}`);
            sample.push(`[${value.var_name}]`);
        } else {
            code.push(escape(`%c${value.value}`, true));
            sample.push(value.value);
        }
    });

    return `/**\n${WHITESPACE}* Function writing "${sample.join("")}" to console.\n${WHITESPACE}**/\n` +
        `function print${iter}thLine (${declaration.join(", ")}) {\n` +
        `${INTENT}console.log(${code.join(", ")}, ${CSSes.join(", ")});\n` +
        `}`;
}
