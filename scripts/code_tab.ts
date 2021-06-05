import { Generic } from "../core/langs";
import { replace_between } from "../core/utils";



/**
 * Function, creating spans, formatted with given css, for each line of given string, and then joining them again.
 * @param str string to format.
 * @param css css string to format with.
 * @returns string of spans, containing formatted text.
 */
function format (str: string, css: string): string {
    return str.split('\n').map((value: string): string => {
        const span = document.createElement('span');
        span.style.cssText = css;
        span.innerHTML = value;
        return span.outerHTML;
    }).join('\n');
}

/**
 * Interface, representing string, matched by regexp and replaced with span. It has following fields:
 * + `str` - matched string, wrapped with spans.
 * + `start` - start position of matched string in searched string.
 * + `len` - length of initial matched string.
 */
interface Match {
    str: string;
    start: number;
    len: number;
}

/**
 * Non breakable tab character.
 */
const TAB = '\u00a0\u00a0\u00a0\u00a0';

/**
 * Function, processing generated code and formatting parts, matched by regexps, with spans and styles.
 * It also replaces whitespaces with &nbsp;'s for them not to be omitted between spans.
 * It also does not support nested spans, so all matches are sorted and the ones, starting inside of the others, will be omitted.<br/>
 * For example, (match1) {match2}: a(bc{def)ghi}jk - match 2 omitted, result: a(bcdef)ghijk.
 * @param generated generated code with regexps and bound css strings.
 * @returns html string, formatted with spans.
 */
export function code (generated: Generic): string {
    let code = generated.code.replace(/ /g, '\u00a0').replace(/\t/g, TAB);

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
