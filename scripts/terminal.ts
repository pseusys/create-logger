import { convert } from "../core/converter";
import { drop_term_changers, reflect_term_changers } from "./style_tab";
import { Entry, VAR_NAMES } from "../core/constants";
import { construct } from "../core/langs";
import {load, ranger, save} from "./ranger";



/**
 * Div representing a "terminal window", with following structure:<br/>
 * terminal<br/>
 *  |- .line (represents a terminal line, in 'STYLE' mode only one at a time can be selected)<br/>
 *  |   |- .line-number (represents a line number, in 'STYLE' mode makes parent line chosen)<br/>
 *  |   |- .line-content (terminal text, contains styled spans)<br/>
 *  | ...<br/>
 *  |- .line<br/>
 *      |- #line-adder.line-number (adds and chooses a new line in 'STYLE' mode only)
 * @see TERMINAL_STATE terminal mode
 * @see choose_line choose line
 */
export const terminal = document.getElementById('terminal');



/**
 * Terminal on key down handler (works in 'STYLE' mode only).
 * Has following functionality:
 * * On 'Enter' creates and chooses a new line below current.
 * * On 'Backspace' deletes a letter, keeping formatting ability.
 * * On 'ArrowUp' and 'ArrowDown' chooses upper or lower line respectively, keeping caret position if possible.
 * - NB! Stepping through span requires additional arrow key pressing:
 *     <span>sample</span><span>text</span>: 11 arrows to walk through.
 * @see TERMINAL_STATE terminal mode
 * @see choose_line choose line
 */
terminal.onkeydown = (event) => {
    if (mode != TERMINAL_STATE.STYLE) return;

    const selection = document.getSelection();
    if (selection.rangeCount == 0) return;

    if (event.key === 'Enter') {
        event.preventDefault();
        choose_line(create_line(get_chosen_line()));
    } else if (event.key == 'Backspace') {
        if (selection.isCollapsed) {
            const range = selection.getRangeAt(0);
            const chosen_children = get_chosen_line_content().children;
            if ((range.startContainer.textContent == '') && (chosen_children.length == 1)) {
                if (chosen_children[0].classList.length != 0) {
                    chosen_children[0].className = '';
                    reflect_term_changers(selection.getRangeAt(0));
                } else {
                    get_chosen_line().remove();
                    reorder_lines();
                }
                event.preventDefault();
            }
        } else event.preventDefault();
    } else if ((event.key == 'ArrowUp') || (event.key == 'ArrowDown')) {
        const chosen = get_chosen_line();
        const target = event.key == 'ArrowUp' ? chosen.previousElementSibling : chosen.nextElementSibling;
        choose_line(target as HTMLDivElement, selection._get_focus_offset_in_node(chosen) - 1);
        event.preventDefault();
    }
};

/**
 * Terminal on click handler (works in 'STYLE' mode only).
 * Has following functionality:
 * * Restores saved selection (if any).
 * * If 'line-adder' clicked, adds and chooses line.
 * * If 'line-number' clicked, chooses line.
 * @see TERMINAL_STATE terminal mode
 * @see choose_line choose line
 */
terminal.onclick = (event) => {
    if (mode != TERMINAL_STATE.STYLE) return;
    load(true);

    const target = event.target as HTMLElement;
    if (target.id === 'line-adder') choose_line(create_line(null, target.parentElement as HTMLDivElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement as HTMLDivElement);
};



// Saving range section.

/**
 * Div styled in a special way to reflect saved range (replacement for ::selection class).
 * It is transparent for clicks.
 */
const saved_selection = document.createElement("DIV");
saved_selection.classList.add('selection');
terminal.before(saved_selection);

/**
 * Function setting given selection (current selection in most cases) to saved range if it is not a terminal selection.
 * Beforehand it checks if given selection already is in terminal and if saved range is a valid terminal selection.
 * @see range_in_place terminal selection
 * @param selection given selection
 */
/*
function set_focus (selection: Selection) {
    if (!selection_in_place(selection) && range_in_place(ranger.range)) {
        selection.removeAllRanges();
        selection.addRange(ranger.range);
    }
}
*/

/**
 * Function to visually reflect styled spans in given range.
 * It applies and sets 'saved_selection' div to given selection ('selection styling').
 * It also saves given range to saved range.
 * @see terminal styled spans
 */
export function reflect_nodes (): void {
    const rect = ranger.range.getBoundingClientRect();
    saved_selection.style.top = (get_chosen_line().getBoundingClientRect().top - 4) + "px";
    saved_selection.style.left = rect.left + "px";
    saved_selection.style.width = (rect.width + 2) + "px";
    saved_selection.style.height = (get_chosen_line().getBoundingClientRect().height + 4) + "px";
    saved_selection.style.visibility = "visible";
}

/**
 * Function to remove selection styling, resetting 'saved selection' div.
 * @see reflect_nodes selection styling
 * @see choose_line chosen line
 */
function clear_selected () {
    saved_selection.style.top = "0";
    saved_selection.style.left = "0";
    saved_selection.style.width = "0";
    saved_selection.style.height = "0";
    saved_selection.style.visibility = "hidden";
}



// Terminal mode section.

/**
 * Strict enum of terminal states, modes. There are generally four terminal states:
 * * 'GENERAL' - terminal disabled, none of the contents clickable or selectable, view-only mode.
 * * 'STYLE' - main and default state, only one line at a time active and selectable, line numbers / adder active, styled spans.
 * * 'PREVIEW' - on each line instead of styled spans ASCII escape sequences presented, many lines selectable, line numbers / adder inactive.
 * * 'CODE' - formatting compiled to code in selected language with different lines number, many lines selectable, line numbers / adder inactive.
 * @see terminal styled spans
 */
type TERMINAL_STATE = "GENERAL" | "STYLE" | "PREVIEW" | "CODE";
export const TERMINAL_STATE = {
    get GENERAL(): TERMINAL_STATE { return "GENERAL"; },
    get STYLE(): TERMINAL_STATE { return "STYLE"; },
    get PREVIEW(): TERMINAL_STATE { return "PREVIEW"; },
    get CODE(): TERMINAL_STATE { return "CODE"; }
}

/**
 * Current terminal mode.
 */
export let mode = TERMINAL_STATE.STYLE;
/**
 * Array containing lines of styled spans for converting to Entries and saving while current terminal mode is 'CODE'.
 * @see Entry Entries
 * @see terminal styled spans
 * @see TERMINAL_STATE terminal mode
 */
export let editableHTML: string[];
/**
 * A special line number with '+' sign adding a new line and choosing it.
 * @see choose_line choose line
 */
const line_adder = document.getElementById('line-adder');

/**
 * Function switching terminal to a new mode, performs exit from old one and enter to new one.
 * @see exitMode exit mode
 * @see enterMode enter mode
 *
 * @param new_mode new terminal mode
 */
export function switch_mode (new_mode: TERMINAL_STATE) {
    exitMode(mode);
    enterMode(new_mode);
    mode = new_mode;
}

/**
 * Function to exit terminal mode, performing following:
 * * 'STYLE': clears selection styling and resets term changers, also saves actual line-contents to editableHTML.
 * * 'CODE': adjusts line number to number of formatted lines in editableHTML.
 * * default: makes line-contents unselectable, line-adder invisible and sets line-numbers to default cursor.
 * @see TERMINAL_STATE terminal mode
 * @see reflect_nodes selection styling
 * @see drop_term_changers reset term changers
 * @see adjust_lines
 * @see editableHTML
 * @param old_mode old terminal state
 */
function exitMode (old_mode: TERMINAL_STATE) {
    disable_and_clear();
    let line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
    let line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
    switch (old_mode) {
        case TERMINAL_STATE.STYLE:
            drop_term_changers();
            editableHTML = [];
            for (const content of line_contents) editableHTML.push(content.innerHTML);
            break;
        case TERMINAL_STATE.CODE:
            adjust_lines(editableHTML.length);
            line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
            line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
            break;
    }
    for (const content of line_contents) content.style.userSelect = 'auto';
    for (const number of line_numbers) number.style.cursor = 'default';
    line_adder.parentElement.style.display = 'none';
}

/**
 * Function to enter terminal mode, performing following:
 * * 'FILE': makes line-contents unselectable and restores line-contents from editableHTML.
 * * 'STYLE': makes line-contents unselectable, line-adder visible sets line-numbers to pointer cursor,
 * restores line-contents from editableHTML and chooses first line.
 * * 'PREVIEW': sets line contents to converted lines from editableHTML.
 * * 'CODE': constructs new line set from editableHTML, adjusts line number to line set number
 * and fills line-contents from line set
 * @see TERMINAL_STATE terminal mode
 * @see editableHTML
 * @see choose_line choose line
 * @see Entry Entries
 * @see htmlToEntries convert styled spans to Entries
 * @see convert convert Entries to ASCII escape sequences
 * @see construct convert Entries to code
 * @see adjust_lines
 * @see terminal styled spans
 * @param new_mode new terminal mode
 */
function enterMode (new_mode: TERMINAL_STATE) {
    const html_copy = [...editableHTML];
    let line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
    let line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
    switch (new_mode) {
        case TERMINAL_STATE.GENERAL:
            for (const content of line_contents) content.style.userSelect = 'none';
            for (const content of line_contents) content.innerHTML = html_copy.shift();
            break;
        case TERMINAL_STATE.STYLE:
            for (const content of line_contents) content.style.userSelect = 'none';
            for (const number of line_numbers) number.style.cursor = 'pointer';
            line_adder.parentElement.style.display = 'flex';
            for (const content of line_contents) content.innerHTML = editableHTML.shift();
            choose_line(terminal.firstElementChild as HTMLDivElement);
            break;
        case TERMINAL_STATE.PREVIEW:
            for (const content of line_contents) content.innerHTML = convert(htmlToEntries(html_copy.shift()));
            break;
        case TERMINAL_STATE.CODE:
            const codes = construct("JavaScript (DOM)", html_copy.map((value: string): Entry[] => {
                return htmlToEntries(value);
            }).filter((value: Entry[]): boolean => {
                return value.length != 0;
            })).split("\n");
            adjust_lines(codes.length);
            line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
            line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
            for (const content of line_contents) {
                content.style.userSelect = 'auto';
                content.innerHTML = codes.shift();
            }
            for (const number of line_numbers) number.style.cursor = 'default';
            break;
    }
}



// Lines management & style section.

/**
 * Function to reset terminal state in 'STYLE' mode.
 * It makes line-contents not editable, clears selection styling and removes chosen line.
 * @see TERMINAL_STATE terminal mode
 * @see reflect_nodes selection styling
 * @see choose_line chosen line
 */
function disable_and_clear () {
    const content = get_chosen_line_content();
    if (!!content) {
        content.setAttribute('contenteditable', 'false');
        for (const span of content.children) span.setAttribute('contenteditable', 'false');
    }
    clear_selected();

    const line_numbers = document.getElementsByClassName('line-number');
    for (const number of line_numbers) number.classList.remove('chosen');
}

/**
 * Function to choose line, 'chosen line' is the only editable line in 'STYLE' mode. It has special 'chosen' CSS class.
 * It also sets caret to this line with collapsed selection.
 * @see TERMINAL_STATE terminal mode
 * @param line the line to become chosen.
 * @param pos position of caret in chosen line (if it is greater than line length, will be set to line end).
 */
export function choose_line (line: HTMLDivElement, pos?: number) {
    if (!line || !line.classList.contains('line') || (line.children.length != 2)) return;

    const line_number = line.firstElementChild;
    const line_content = line.lastElementChild;

    disable_and_clear();

    line_content.setAttribute('contenteditable', 'true');
    for (const child of line_content.children) child.setAttribute('contenteditable', 'true');
    line_number.classList.add('chosen');

    const range = document.createRange();
    range._set_range_in_node(line_content as HTMLDivElement, pos);
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

/**
 * Function to create a new line at specified position.
 * The line contains line-adder with corresponding number and line-content with one empty span.
 * WARNING: only one parameter should be passed!
 * @param after line after that the new line will be inserted.
 * @param before line before that the new line will be inserted.
 * @return the new line.
 */
function create_line (after: HTMLDivElement = null, before: HTMLDivElement = null): HTMLDivElement {
    const line = document.createElement('div');
    line.classList.add('line');

    const line_number = document.createElement('div');
    line_number.classList.add('line-number');

    const line_content = document.createElement('div');
    line_content.classList.add('line-content');

    const first_span = document.createElement('span');
    first_span.appendChild(document.createTextNode(""));

    line_content.appendChild(first_span);

    line.append(line_number, line_content);

    if (!!after) after.after(line);
    if (!!before) before.before(line);
    reorder_lines();
    return line;
}

/**
 * Function setting line number to given number.
 * It removes lines if current number is greater than given and adds if current number is less than given.
 * @param num new lines number.
 */
function adjust_lines (num: number) {
    const lines = [...document.getElementsByClassName('line')].filter((value: HTMLDivElement): boolean => {
        return value.children.length > 1;
    }) as HTMLDivElement[];
    if (lines.length == num) return;
    const diff = Math.abs(lines.length - num);
    if (lines.length > num) for (let i = 0; i < diff; i++) lines[i].remove();
    else for (let i = 0; i < diff; i++) lines[0] = create_line(null, lines[0]);
    reorder_lines();
}

function reorder_lines() {
    ([...document.getElementsByClassName('line')].filter((value: HTMLDivElement): boolean => {
        return value.children.length > 1;
    }) as HTMLDivElement[]).forEach((line: HTMLDivElement, index: number) => {
        line.firstElementChild.innerHTML = String(index + 1);
    });
}



// Getting text section.

/**
 * Function to get text in given range. It extracts text from line-contents only.
 * @param range range to extract text from.
 */
export function getClearText(range: Range): string {
    return [...terminal.childNodes].reduce((previous: string, line: HTMLDivElement): string => {
        const content = line.lastElementChild;
        if (range.intersectsNode(content)) {
            let text = content.textContent;
            const start = range._get_range_start_in_node(content)?.offset ?? 0;
            const end = range._get_range_end_in_node(content)?.offset ?? text.length;
            return previous + text.substring(start, end) + '\n';
        } else return previous;
    }, "");
}



// Special nodes section.

/**
 * Function to get chosen line or null.
 * @see choose_line chosen line
 */
function get_chosen_line (): HTMLDivElement | null {
    const chosen = document.getElementsByClassName('chosen')[0];
    if (!!chosen ) return chosen.parentElement as HTMLDivElement;
    else return null;
}

/**
 * Function to get chosen line-content or null.
 * @see choose_line chosen line
 */
export function get_chosen_line_content (): HTMLDivElement | null {
    const line = get_chosen_line();
    if (!!line) return get_chosen_line().lastElementChild as HTMLDivElement;
    else return null;
}

/**
 * Function checking if given range is a 'terminal selection' - a valid selection af some part of single
 * line-content, to witch any formatting may be applied.
 * @param range range to check.
 */
export function range_in_place (range: Range): boolean {
    if (!range) return false;
    const selectionParent = range.commonAncestorContainer;
    const chosen = get_chosen_line_content();
    if (!chosen) return false;
    else return get_chosen_line_content().contains(selectionParent);
}

/**
 * Function to check if given selection is a 'terminal selection'.
 * @see range_in_place terminal selection
 * @param selection selection to check.
 */
export function selection_in_place (selection: Selection): boolean {
    if (selection.rangeCount == 0) return false;
    return range_in_place(selection.getRangeAt(0));
}

/**
 * Function to find the (parent) span corresponding to any selected node in terminal.
 * @throws DOMException if no span can be found for given element.
 * @param node given node.
 */
export function find_span_for_place (node: Node): HTMLSpanElement {
    if ((node.nodeType == Node.TEXT_NODE) || (node.nodeName == "BR")) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLSpanElement;
}



// Export section.

/**
 * Function converting inner HTML string to array of Entries, that can be converted to ASCII escape sequences or code.
 * Inner HTML string should contain styled spans.
 * @see Entry Entries
 * @see terminal styled spans
 * @param inner inner HTML string to convert.
 * @return Entries array or empty array if no entries can be converted.
 */
function htmlToEntries(inner: string): Entry[] {
    const div = document.createElement('div');
    div.innerHTML = inner;
    const entries = [];
    [...div.children].forEach((value: HTMLSpanElement) => {
        if (value.textContent != "") entries.push({
            classes: [...value.classList],
            value: value.textContent,
            var_name: value.getAttribute(VAR_NAMES["var-name"]),
            var_type: value.getAttribute(VAR_NAMES["var-type"])
        });
    });
    div.remove();
    return entries;
}
