import { Generic } from "../core/langs";
import { replace_between } from "../core/utils";

function format (str: string, css: string): string {
    return str.split('\n').map((value: string): string => {
        const span = document.createElement('span');
        span.style.cssText = css;
        span.innerHTML = value;
        return span.outerHTML;
    }).join('\n');
}

interface Match {
    str: string;
    start: number;
    len: number;
}

const TAB = '&nbsp;&nbsp;&nbsp;&nbsp;';

export function code (generated: Generic): string {
    let code = generated.code.replace(/ /g, '&nbsp;').replace(/\t/g, TAB);

    let matches: Match[] = [];
    for (const formatting of generated.formatting) {
        [...code.matchAll(formatting.format)].forEach((value: RegExpMatchArray) => {
            const found = value.toString();
            matches.push({ str: format(value.toString(), formatting.css), start: value.index, len: found.length });
        });
    }
    matches.sort((a: Match, b: Match): number => {
        return a.start - b.start;
    });

    let iterator = 0;
    matches = matches.filter((value: Match): boolean => {
        if (value.start < iterator) return false;
        else {
            iterator = value.start + value.len;
            return true;
        }
    });

    iterator = 0;
    for (const match of matches) {
        const start = match.start + iterator;
        const end = match.start + match.len + iterator;
        code = replace_between(code, start, end, match.str);
        iterator += match.str.length - match.len;
    }
    return code;
}
