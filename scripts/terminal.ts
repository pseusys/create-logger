//FIXME
import { convert, Entry } from "../core/converter";
import { reflect_selection } from "./style_tab";


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
                    reflect_selection(selection);
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
    const target = event.target as HTMLElement;
    //if (!target.parentElement.classList.contains('line') || !editable) return;
    if (target.id === 'line-adder') choose_line(create_line(null, target.parentElement as HTMLDivElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement);
};



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
    const line_contents = [...document.getElementsByClassName('line-content')] as HTMLDivElement[];
    const line_numbers = [...document.getElementsByClassName('line-number')] as HTMLDivElement[];
    exitMode(mode, line_numbers, line_contents);
    enterMode(newMode, line_numbers, line_contents);
    mode = newMode;
}

function exitMode (oldMode: TERMINAL_STATE, line_numbers: HTMLDivElement[], line_contents: HTMLDivElement[]): void {
    disableAndClear();
    switch (oldMode) {
        case TERMINAL_STATE.FILE:
        case TERMINAL_STATE.STYLE:
            editableHTML = [];
            for (const content of line_contents) editableHTML.push(content.innerHTML);
        default:
            for (const content of line_contents) content.style.userSelect = 'auto';
            for (const number of line_numbers) number.style.cursor = 'default';
            lineAdder.parentElement.style.display = 'none';
            break;
    }
}

function enterMode (newMode: TERMINAL_STATE, line_numbers: HTMLDivElement[], line_contents: HTMLDivElement[]): void {
    switch (newMode) {
        case TERMINAL_STATE.FILE:
            for (const content of line_contents) content.style.userSelect = 'none';
            for (const content of line_contents) content.innerHTML = editableHTML.shift();
            break;
        case TERMINAL_STATE.STYLE:
            for (const number of line_numbers) number.style.cursor = 'pointer';
            lineAdder.parentElement.style.display = 'flex';
            for (const content of line_contents) content.innerHTML = editableHTML.shift();
            break;
        case TERMINAL_STATE.PREVIEW:
            for (const content of line_contents) content.innerHTML = convert(htmlToEntries([...editableHTML].shift()));
            break;
        case TERMINAL_STATE.CODE:
            for (const content of line_contents) content.innerHTML = "";
            break;
    }
}



function disableAndClear() {
    const line_contents = document.getElementsByClassName('line-content');
    for (const content of line_contents) {
        content.setAttribute('contenteditable', 'false');
        for (const span of content.children) span.setAttribute('contenteditable', 'false');
    }

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



function htmlToEntries(inner: string): Entry[] {
    const div = document.createElement('div');
    div.innerHTML = inner;
    return [...div.children].map((value: HTMLSpanElement): Entry => {
        return {
            classes: [...value.classList],
            value: value.textContent
        };
    });
}



function get_chosen_line (): HTMLDivElement {
    return document.getElementsByClassName('chosen')[0].parentElement as HTMLDivElement;
}

export function get_chosen_line_content (): HTMLDivElement {
    return get_chosen_line().lastElementChild as HTMLDivElement;
}

export function selection_in_place (selection: Selection): boolean {
    const selectionParent = selection.getRangeAt(0).commonAncestorContainer;
    return get_chosen_line_content().contains(selectionParent);
}

export function find_span_for_place (node: Node): HTMLSpanElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLSpanElement;
}
