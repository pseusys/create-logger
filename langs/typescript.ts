import {Entry} from "../core/constants";
import {TYPES} from "../core/langs";
import {convert} from "../core/converter";


export default function construct (str: Entry[][]): string {
    return create_function_for_line(str[0], 0);
}



const INTENT = "\u00A0\u00A0\u00A0\u00A0";

function escape (str: string, separate: boolean = false): string {
    let res = str.replace(/\\033/g, "\\u001b")
        .replace(/["']/g, "\"");
    if (separate) res = "\"" + res + "\"";
    return res;
}

function type (type: string): string {
    switch (type) {
        case TYPES.int:
        case TYPES.float:
            return "number";
        case TYPES.char:
        case TYPES.string:
            return "string";
        case TYPES.int_array:
            return "number[]";
        case TYPES.string_array:
            return "string[]";
    }
}



//TODO: extract constants from lines
function determine_constants () {

}

function create_function_for_line (entries: Entry[], iter: number): string {
    const declaration = entries.map((value: Entry): string => {
        let currentVar = "";
        if (!!value.var_name) {
            let currentVarType = value.var_type ?? "any";
            currentVarType = type(currentVarType) ?? currentVarType;
            currentVar += value.var_name + ": " + currentVarType;
        }
        return currentVar;
    }).filter((value: string): boolean => {
        return !!value;
    });
    const code = [];
    entries.forEach((value: Entry): void => {
        const str = convert([value], true);
        if (!!value.var_name) {
            const divided = str.split(value.value);
            code.push(escape(divided[0], true));
            code.push(escape(value.var_name, false));
            code.push(escape(divided[1], true));
        } else code.push(escape(str, !value.var_name));
    });
    return "function print" + iter + "thLine (" + declaration.join(", ") + "): string {\n" +
        INTENT + "return " + code.join(" + ") +
        ";\n}";
}
