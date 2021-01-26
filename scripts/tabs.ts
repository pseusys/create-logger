import { change } from "./cutter";
import { switchMode } from "./terminal";

let active_tab: string;

export function open_tab(tab_link, tab_content) {
    const tab_contents = document.getElementsByClassName('tab-content');
    for (const content of tab_contents as HTMLCollectionOf<HTMLElement>) content.style.display = 'none';

    const tab_links = document.getElementsByClassName('tab-link');
    for (const link of tab_links as HTMLCollectionOf<HTMLElement>) link.classList.remove('active');

    document.getElementById(tab_content).style.display = 'flex';
    document.getElementById(tab_link).classList.add('active');

    active_tab = tab_content;
}

document.getElementById('tab-links').addEventListener('click', event => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('tab-link')) {
        const tab_contents = document.getElementById('tab-contents');
        const header = document.getElementById('header');
        open_tab(target.id, target.id.replace('tab', 'content'));

        if (target.classList.contains('collapsing')) {
            tab_contents.style.display = 'none';
            header.style.height = 'auto';
            switchMode(false);
        } else {
            tab_contents.style.display = '';
            header.style.height = '';
            switchMode(true);
        }
    }
});



function checkAndSubmit(type: string, value: string | boolean): void {
    const selectionParent = document.getSelection().getRangeAt(0).commonAncestorContainer;
    if (((selectionParent.nodeType == Node.ELEMENT_NODE)
        && ((selectionParent as HTMLElement).classList.contains('line-content')))
        || (selectionParent.parentElement.nodeName == 'SPAN'))

        change({ type: type, value: value });
}

const terminal_changers = document.getElementsByClassName('term-changer') as HTMLCollectionOf<HTMLInputElement>;
for (const elem of terminal_changers) {
    elem.addEventListener('change', () => {
        if (elem.getAttribute('type') == 'checkbox')
            checkAndSubmit(elem.getAttribute('name'), elem.checked);
        else
            checkAndSubmit(elem.getAttribute('name'), elem.value);
    });
}
