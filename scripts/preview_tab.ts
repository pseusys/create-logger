import { convert, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, InEntry, OutEntry } from "../core/converter";
import { CLASS_CODES } from "../core/constants";
import { get } from "./storer";



function style_to_span (style: string): string {
    const span = document.createElement('span');
    for (const code in CLASS_CODES) if (style == CLASS_CODES[code]) span.classList.add(code);
    span.textContent = style;
    return span.outerHTML;
}

function style_out (str: string): string {
    const span = document.createElement('span');
    span.classList.add('sty-bold');
    span.textContent = str;
    return span.outerHTML;
}

export function view (entries: InEntry[]): string {
    const converted = convert(entries, get("vars-check", false));
    let result = "";
    converted.forEach((value: OutEntry) => {
        result += ESCAPE_START;
        result += value.prefix.map((pref: string): string => {
            return style_to_span(pref);
        }).join(ESCAPE_SEPARATOR);
        result += ESCAPE_END;

        result += style_out(value.value);

        result += ESCAPE_START;
        result += value.postfix.map((pref: string): string => {
            return style_to_span(pref);
        }).join(ESCAPE_SEPARATOR);
        result += ESCAPE_END;
    });
    return result;
}
