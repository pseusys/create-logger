import { InEntry } from "../core/converter";
import { class_to_CSS, Generic, Settings } from "../core/langs";



export default function construct (str: InEntry[][], set: Settings): Generic {
    const codes = str.map((current: InEntry[], index: number) => {
        return create_function_for_line(current, index);
    });
    const warning = "// Following functions work in DOM environment only. For Node.js analogues see 'TypeScript'."
    return { code: `${warning}\n\n${codes.join("\n\n")}`, formatting: CODE_STYLE };
}



function escape (str: string, double: boolean = false): string {
    let res = str.replace(/"/g, '\\"').replace(/'/g, "\\'");
    res = double ? `"${res}"` : `'${res}'`;
    return res;
}

const CODE_STYLE = [
    { format: /function/g, css: 'color: GoldenRod' },
    { format: /(?:console|document|window)/g, css: 'color: DarkMagenta; font-weight: 700; font-style: italic' },

    { format: /(?<=function)(?:.*)(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /(?<=\.)(?:.*)(?=\([\s\S]*\))/g, css: 'color: Gold' },
    { format: /;(?=\n)/g, css: 'color: Gold' },

    { format: /(?:"|'[^']*')/g, css: 'color: SeaGreen' },
    { format: /(?<="%c)(?:[^"]*)(?=")/g, css: 'color: Khaki' },
    { format: /%c/g, css: 'color: RosyBrown; font-weight: 700' },
    { format: /\\u[0-9]+b\[(?:[0-9];*)+m/g, css: 'color: Khaki; font-weight: 700' },

    { format: /\/\/.*/g, css: 'color: Silver' },
    { format: /\/\*\*[\s\S]*\*\*\//g, css: 'color: SeaGreen' }
];



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
        CSSes.push(escape(css, false));
        if (!!value.var_name) {
            code.push(`"%c" + ${value.var_name}`);
            sample.push(`[${value.var_name}]`);
        } else {
            code.push(escape(`%c${value.value}`, true));
            sample.push(value.value);
        }
    });

    return `/**\n * Function writing "${sample.join("")}" to console.\n **/\n` +
        `function print${iter}thLine (${declaration.join(", ")}) {\n` +
        `\tconsole.log(${code.join(" + ")}, ${CSSes.join(", ")});\n` +
        `}`;
}
