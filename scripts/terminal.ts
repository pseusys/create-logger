//FIXME
import { convert } from "../core/converter";
import {drop_term_changers, reflect_selection} from "./style_tab";
import {get_selected} from "./cutter";
import {Entry, VAR_NAMES} from "../core/constants";
import {construct} from "../core/langs";


export const terminal = document.getElementById('terminal');

terminal.onkeydown = (event) => {
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
                    reflect_selection(selection.getRangeAt(0));
                }
                event.preventDefault();
            }
        } else event.preventDefault();
    } else if ((event.key == 'ArrowUp') || (event.key == 'ArrowDown')) {
        const chosen = get_chosen_line();
        const target = event.key == 'ArrowUp' ? chosen.previousElementSibling : chosen.nextElementSibling;
        choose_line(target, selection._getFocusOffsetInNode(chosen) - 1);
        event.preventDefault();
    }
};

terminal.onclick = (event) => {
    if (!!saved_focus) {
        const selection = document.getSelection();
        set_focus(selection);
    }

    const target = event.target as HTMLElement;
    if (target.id === 'line-adder') choose_line(create_line(null, target.parentElement as HTMLDivElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement);
};



// FIXME: How to reflect visually this saved Range? Honestly, I don't know...
let saved_focus: Range = null;

export function get_focus (): Range {
    return saved_focus;
}

function set_focus (selection: Selection) {
    if (!selection_in_place(selection) && range_in_place(saved_focus)) {
        selection.removeAllRanges();
        selection.addRange(saved_focus);
    }
}

export function reflect_nodes (range: Range): void {
    clear_selected();
    get_selected(range).forEach((value: HTMLSpanElement): void => {
        value.classList.add('selected');
    });
    saved_focus = range;
}

function clear_selected () {
    saved_focus = null;
    const chosen = get_chosen_line_content();
    if (!!chosen) [...chosen.children].forEach((value) => {
        value.classList.remove('selected');
    });
}



type TERMINAL_STATE = "FILE" | "STYLE" | "PREVIEW" | "CODE";
export const TERMINAL_STATE = {
    get FILE(): TERMINAL_STATE { return "FILE"; },
    get STYLE(): TERMINAL_STATE { return "STYLE"; },
    get PREVIEW(): TERMINAL_STATE { return "PREVIEW"; },
    get CODE(): TERMINAL_STATE { return "CODE"; },
}

export let mode = TERMINAL_STATE.STYLE;
export let editableHTML: string[];
const lineAdder = document.getElementById('line-adder');

export function switchMode(newMode: TERMINAL_STATE): void {
    exitMode(mode);
    enterMode(newMode);
    mode = newMode;
}

function exitMode (oldMode: TERMINAL_STATE): void {
    disableAndClear();
    let line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
    let line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
    switch (oldMode) {
        case TERMINAL_STATE.STYLE:
            clear_selected();
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
    lineAdder.parentElement.style.display = 'none';
}

function enterMode (newMode: TERMINAL_STATE): void {
    const html_copy = [...editableHTML];
    let line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
    let line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
    switch (newMode) {
        case TERMINAL_STATE.FILE:
            for (const content of line_contents) content.style.userSelect = 'none';
            for (const content of line_contents) content.innerHTML = html_copy.shift();
            break;
        case TERMINAL_STATE.STYLE:
            for (const content of line_contents) content.style.userSelect = 'none';
            for (const number of line_numbers) number.style.cursor = 'pointer';
            lineAdder.parentElement.style.display = 'flex';
            for (const content of line_contents) content.innerHTML = editableHTML.shift();
            choose_line(terminal.firstElementChild);
            break;
        case TERMINAL_STATE.PREVIEW:
            for (const content of line_contents) content.innerHTML = convert(htmlToEntries(html_copy.shift()));
            break;
        case TERMINAL_STATE.CODE:
            const codes = construct("typescript", html_copy.map((value): Entry[] => {
                return htmlToEntries(value);
            })).split("\n");
            adjust_lines(codes.length); // FIXME: duplications!
            line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
            line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
            for (const content of line_contents) content.style.userSelect = 'auto';
            for (const number of line_numbers) number.style.cursor = 'default';
            for (const content of line_contents) content.innerHTML = codes.shift();
            break;
    }
}



function getText(node: Node, range: Range): string {
    if (node.nodeName == 'DIV') {
        const elem = node as HTMLDivElement;
        if (elem.classList.contains('line-number')) return "";
        if (elem.classList.contains('line-content')) return elem.textContent + "\n";
        return [...elem.childNodes].reduce((previous: string, current: Node): string => {
            return previous + getText(current, range);
        }, "");
    } else return node.textContent; // partial
}

export function getClearText(range: Range): string {
    return [...range.commonAncestorContainer.childNodes].reduce((previous: string, current: Node): string => {
        if (range.intersectsNode(current)) {
            const text = getText(current, range);
            if (current == range.startContainer) return previous + text.substring(range.startOffset);
            else if (current == range.endContainer) return previous + text.substring(0, range.endOffset);
            else return previous + text;
        } else return previous;
    }, "");
}



function disableAndClear() {
    const content = get_chosen_line_content();
    if (!!content) {
        content.setAttribute('contenteditable', 'false');
        for (const span of content.children) span.setAttribute('contenteditable', 'false');
    }
    clear_selected();

    const line_numbers = document.getElementsByClassName('line-number');
    for (const number of line_numbers) number.classList.remove('chosen');
}

export function choose_line (line, pos?) {
    if (!line || !line.classList.contains('line') || (line.children.length != 2)) return;

    const line_number = line.firstElementChild;
    const line_content = line.lastElementChild;

    disableAndClear();

    line_content.setAttribute('contenteditable', 'true');
    for (const child of line_content.children) child.setAttribute('contenteditable', 'true');
    line_number.classList.add('chosen');

    const range = document.createRange();
    range._setRangeInNode(line_content, pos);
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function create_line (after: HTMLDivElement = null, before: HTMLDivElement = null): HTMLDivElement {
    const line = document.createElement('div');
    line.classList.add('line');

    const line_number = document.createElement('div');
    line_number.classList.add('line-number');
    line_number.innerHTML = String(document.getElementsByClassName('line').length);

    const line_content = document.createElement('div');
    line_content.classList.add('line-content');
    line_content.appendChild(document.createElement('span'));

    line.append(line_number, line_content);

    if (!!after) after.after(line);
    if (!!before) before.before(line);
    return line;
}

function adjust_lines (num: number): void {
    const lines = [...document.getElementsByClassName('line')].filter((value: HTMLDivElement): boolean => {
        return value.children.length > 1;
    }) as HTMLDivElement[];
    if (lines.length == num) return;
    const diff = Math.abs(lines.length - num);
    let last_line = lines[lines.length - 1];
    if (lines.length > num) for (let i = 0; i < diff; i++) lines[lines.length - 1 - i].remove();
    else for (let i = 0; i < diff; i++) last_line = create_line(last_line, null);
}



function htmlToEntries(inner: string): Entry[] {
    const div = document.createElement('div');
    div.innerHTML = inner;
    return [...div.children].map((value: HTMLSpanElement): Entry => {
        return {
            classes: [...value.classList],
            value: value.textContent,
            var_name: value.getAttribute(VAR_NAMES["var-name"]),
            var_type: value.getAttribute(VAR_NAMES["var-type"])
        };
    });
}



function get_chosen_line (): HTMLDivElement | null {
    const chosen = document.getElementsByClassName('chosen')[0];
    if (!!chosen ) return chosen.parentElement as HTMLDivElement;
    else return null;
}

export function get_chosen_line_content (): HTMLDivElement | null {
    const line = get_chosen_line();
    if (!!line) return get_chosen_line().lastElementChild as HTMLDivElement;
    else return null;
}

export function range_in_place (range: Range): boolean {
    const selectionParent = range.commonAncestorContainer;
    const chosen = get_chosen_line_content();
    if (!chosen) return false;
    else return get_chosen_line_content().contains(selectionParent);
}

export function selection_in_place (selection: Selection): boolean {
    if (selection.rangeCount == 0) return false;
    return range_in_place(selection.getRangeAt(0));
}

export function find_span_for_place (node: Node): HTMLSpanElement {
    if ((node.nodeType == Node.TEXT_NODE) || (node.nodeName == "BR")) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLSpanElement;
}
