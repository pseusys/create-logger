import { convert, ESCAPE_END, ESCAPE_SEPARATOR, ESCAPE_START, ESCAPE_TERMINATE, InEntry, OutEntry } from "../core/converter";
import { CLASS_CODES } from "../core/constants";
import { get } from "./storer";



/**
 * Function, wrapping a number, representing an ASCII style, with correspondingly formatted span.
 * @param style number to wrap.
 * @returns html string.
 */
function style_to_span (style: number): string {
    const span = document.createElement('span');
    for (const code in CLASS_CODES) if (style == CLASS_CODES[code]) span.classList.add(code);
    span.textContent = `${style}`;
    return span.outerHTML;
}

/**
 * Function, wrapping text with span, formatted as bold text, to accent this string.
 * @param str string to wrap.
 * @returns html string.
 */
function style_out (str: string): string {
    const span = document.createElement('span');
    span.classList.add('sty-bold');
    span.textContent = str;
    return span.outerHTML;
}

/**
 * Function, converting array of formatted strings to ASCII string with corresponding escape sequences,
 * formatted with spans.
 * @param entries formatted strings
 * @returns html strings
 */
export function preview (entries: InEntry[]): string {
    const converted = convert(entries, get("vars-check", false));
    let result = "";
    converted.forEach((value: OutEntry) => {
        if (value.prefix.length > 0) {
            result += ESCAPE_START;
            result += value.prefix.map((pref: number): string => {
                return style_to_span(pref);
            }).join(ESCAPE_SEPARATOR);
            result += ESCAPE_END;
        }
        result += style_out(value.value.replace(/ /g, '\u00a0'));
        if (value.prefix.length > 0) result += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
    });
    return result;
}
