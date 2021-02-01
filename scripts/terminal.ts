import { convert, Entry } from "../core/converter";
import { reflect_selection } from "./style_tab";

export const terminal = document.getElementById('terminal');
export let editable = true;
let editableHTML: string[];



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

terminal.onclick = (event) => {
    const target = event.target as HTMLElement;
    if (!target.parentElement.classList.contains('line') || !editable) return;
    if (target.id === 'line-adder') choose_line(create_line(null, target.parentElement as HTMLDivElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement);
};



function htmlToEntries(children: HTMLCollection): Entry[] {
    const entries = [];
    for (const child of children) entries.push({
        classes: [...child.classList],
        value: (child as HTMLSpanElement).textContent
    });
    return entries;
}

export function switchMode(edit: boolean): void {
    const line_contents = document.getElementsByClassName('line-content');
    const line_numbers = document.getElementsByClassName('line-number');

    if (editable && !edit) {
        disableAndClear();
        editableHTML = [];
        for (const content of line_contents) {
            editableHTML.push(content.innerHTML);
            content.innerHTML = convert(htmlToEntries(content.children));
        }
        for (const content of line_contents as HTMLCollectionOf<HTMLDivElement>) content.style.userSelect = 'auto';
        for (const number of line_numbers as HTMLCollectionOf<HTMLDivElement>) number.style.cursor = 'default';
        document.getElementById('line-adder').parentElement.style.display = 'none';

    } else if (!editable && edit) {
        for (const content of line_contents) content.innerHTML = editableHTML.shift();
        for (const content of line_contents as HTMLCollectionOf<HTMLDivElement>) content.style.userSelect = '';
        for (const number of line_numbers as HTMLCollectionOf<HTMLDivElement>) number.style.cursor = '';
        document.getElementById('line-adder').parentElement.style.display = '';

    } else if (!editable && !edit) for (const content of line_contents) content.innerHTML = "";
    editable = edit;
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
