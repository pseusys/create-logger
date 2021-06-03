import { InEntry } from "../core/converter";
import { class_to_CSS, Generic, Settings, toast } from "../core/langs";



let readable = true;
let use_module = false, use_strict = false, new_vars = false;

function parse_settings (set: Settings) {
    readable = set.readable;
    use_module = false;
    use_strict = false;
    new_vars = false;
    const unexpected = set.args.filter((value: { key: string, value: string }): boolean => {
        switch (value.key) {
            case 'm':
                use_module = true;
                return false;
            case 's':
                use_strict = true;
                return false;
            case 'v':
                if (value.value == 'new') {
                    new_vars = true;
                    return false;
                } else return !(value.value == 'old');
            default:
                return true;
        }
    });
    if (unexpected.length > 0) toast(`Unexpected settings: ${JSON.stringify(unexpected)}`);
}

function varify (str: string) {
    return str.toUpperCase().replace(/-/g, '_');
}

function construct (str: InEntry[][], set: Settings): Generic {
    parse_settings(set);
    const warning = "// Following functions work in DOM environment only. For Node.js analogues see 'TypeScript'."
    const strict = use_strict ? '\'use strict\';\n' : '';
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const read = readable ? Object.keys(constants).map((value: string): string => {
        return `${(new_vars ? "const" : "var")} ${value} = ${escape(constants[value], false)};`
    }).join('\n') + "\n\n" : "";
    return { code: `${warning}\n${strict}\n${read}${codes.join("\n\n")}`, formatting: styles() };
}



function escape (str: string, double: boolean): string {
    let res = str.replace(/"/g, '\\"').replace(/'/g, "\\'");
    res = double ? `"${res}"` : `'${res}'`;
    return res;
}



function styles () {
    return [
        {format: /var|const|let|export|return|function/g, css: 'color: GoldenRod'},
        {format: /console|document|window/g, css: 'color: DarkMagenta; font-weight: 700; font-style: italic'},

        {format: /(?<=function).*(?=\([\s\S]*\))/g, css: 'color: Gold'},
        {format: /(?<=\.).*?(?=\([\s\S]*\))/g, css: 'color: Gold'},
        {format: /;(?=\n)/g, css: 'color: Gold'},

        {format: readable ? /'[^']*'/g : /"|'[^']*'/g, css: 'color: SeaGreen'},
        {format: readable ? /"(?:[^\\]|\\")*?"/g : /(?<="%c)(?:\\"|[^\\"])*?(?=")/g, css: 'color: Khaki'},
        {format: /%c/g, css: 'color: RosyBrown; font-weight: 700'},
        {format: /\\u[0-9]+b\[(?:[0-9];*)+m/g, css: 'color: Khaki; font-weight: 700'},

        {format: /\/\/.*/g, css: 'color: Silver'},
        {format: /\/\*\*[\s\S]*?\*\*\//g, css: 'color: SeaGreen'}
    ];
}



const constants = { "S": '%c' };

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
            const res = class_to_CSS(value);
            if (readable) {
                const val = varify(value);
                constants[val] = res;
                return val;
            } else return res;
        });
        if (readable) CSSes.push((css.length > 0) ? css.join(" + '; ' + ") : "''");
        else CSSes.push(escape(css.join("; "), false));

        if (!!value.var_name) {
            if (readable) code.push(`S + ${value.var_name}`);
            else code.push(`"%c" + ${value.var_name}`);
            sample.push(`[${value.var_name}]`);
        } else {
            if (readable) code.push(`S + ${escape(value.value, true)}`);
            else code.push(escape(`%c${value.value}`, true));
            sample.push(value.value);
        }
    });

    return `/**\n * Function writing "${sample.join("")}" to console.\n **/\n` +
           `${(use_module ? 'export ' : '')} function print${iter}thLine (${declaration.join(", ")}) {\n` +
           `\tconsole.log(${code.join(" + ")}, ${CSSes.join(", ")});\n` +
           `}\n`;
}



const info = "'-s' - use strict option\n" +
             "'-m' - use module syntax\n" +
             "'-v [old|new]' - use old or new variable declaration";

export default { act: construct, arg: info };
