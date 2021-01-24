/*
terminal_container.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        event.preventDefault();
        new_line();
    }
});
*/

import { DEFAULTS, SEPARATOR } from "../constants";
import { convert, Entry } from "./converter";

export const terminal = document.getElementById('terminal');
let editable = true;
let editableHTML: Array<string>;

function disableAndClear() {
    const line_contents = document.getElementsByClassName('line-content');
    for (const content of line_contents) {
        content.setAttribute('contenteditable', 'false');
        for (const span of content.children) span.setAttribute('contenteditable', 'false');
    }

    const line_numbers = document.getElementsByClassName('line-number');
    for (const number of line_numbers) number.classList.remove('chosen');
}

export function choose_line (line) {
    const line_number = line.firstElementChild;
    const line_content = line.lastElementChild;

    disableAndClear();

    line_content.setAttribute('contenteditable', 'true');
    for (const child of line_content.children) child.setAttribute('contenteditable', 'true');
    line_number.classList.add('chosen');

    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(line_content);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
}

function create_line () {
    const line = document.createElement('div');
    line.classList.add('line');

    const line_number = document.createElement('div');
    line_number.classList.add('line-number');
    line_number.innerHTML = String(document.getElementsByClassName('line').length);

    const line_content = document.createElement('div');
    line_content.classList.add('line-content');

    const new_span = document.createElement('span');
    for (const key in DEFAULTS) new_span.classList.add(key + SEPARATOR + DEFAULTS[key]);

    line_content.appendChild(new_span);

    line.append(line_number, line_content);
    return line;
}

terminal.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (!target.parentElement.classList.contains('line') || !editable) return;
    if (target.id === 'line-adder') choose_line(terminal.insertBefore(create_line(), target.parentElement));
    else if (target.classList.contains('line-number')) choose_line(target.parentElement);
});



function htmlToEntries(children: HTMLCollection): Array<Entry> {
    const entries = [];
    for (const child of children) entries.push({
        classes: [...child.classList],
        value: (child as HTMLElement).innerText
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
        for (const content of line_contents as HTMLCollectionOf<HTMLElement>) content.style.userSelect = 'auto';
        for (const number of line_numbers as HTMLCollectionOf<HTMLElement>) number.style.cursor = 'default';
        document.getElementById('line-adder').parentElement.style.display = 'none';

    } else if (!editable && edit) {
        for (const content of line_contents) content.innerHTML = editableHTML.shift();
        for (const content of line_contents as HTMLCollectionOf<HTMLElement>) content.style.userSelect = '';
        for (const number of line_numbers as HTMLCollectionOf<HTMLElement>) number.style.cursor = '';
        document.getElementById('line-adder').parentElement.style.display = '';

    } else if (!editable && !edit) for (const content of line_contents) content.innerHTML = "";
    editable = edit;
}
