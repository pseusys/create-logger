import { change, getCommonClasses } from "./cutter";
import { selection_in_place, switchMode } from "./terminal";
import { getPostfix, getPrefix } from "../consts/constants";

let active_tab: string;

export function open_tab(tab_link, tab_content) {
    const tab_contents = document.getElementsByClassName('tab-content');
    for (const content of tab_contents as HTMLCollectionOf<HTMLDivElement>) content.style.display = 'none';

    const tab_links = document.getElementsByClassName('tab-link');
    for (const link of tab_links as HTMLCollectionOf<HTMLButtonElement>) link.classList.remove('active');

    document.getElementById(tab_content).style.display = 'flex';
    document.getElementById(tab_link).classList.add('active');

    active_tab = tab_content;
}

document.getElementById('tab-links').onclick = (event) => {
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
};



export function reflect_selection (single?: Element) {
    const classes = getCommonClasses(single);
    if (classes) set_term_changers(classes);
    else drop_term_changers();
}

const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLInputElement[];

for (const elem of term_changers)
    elem.onchange = () => {
        if (!selection_in_place()) return;
        const name = elem.getAttribute('name');
        if (elem.getAttribute('type') == 'checkbox') change({ type: name, value: elem.checked });
        else change({ type: name, value: elem.value });
    };

export function drop_term_changers (): void {
    (document.getElementById('style-content') as HTMLFormElement).reset();
}

export function set_term_changers (classes: string[]): void {
    drop_term_changers();

    for (const cls of classes) {
        const term_changer = [...term_changers].filter((value: HTMLInputElement): boolean => {
            return value.getAttribute('name') == getPrefix(cls);
        });

        if (term_changer.length == 1) {
            if (term_changer[0].getAttribute('type') == 'checkbox') term_changer[0].checked = true;
            else term_changer[0].value = getPostfix(cls);
        } else term_changer.find((value: HTMLInputElement): boolean => {
            return value.value == getPostfix(cls);
        }).checked = true;
    }
}
