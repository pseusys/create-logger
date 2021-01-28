import { change } from "./cutter";
import { selection_in_place, switchMode } from "./terminal";
import { SEPARATOR } from "../consts/constants";

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



const term_changers = document.getElementsByClassName('term-changer') as HTMLCollectionOf<HTMLInputElement>;

for (const elem of term_changers)
    elem.onchange = () => {
        const name = elem.getAttribute('name');
        if (elem.getAttribute('type') == 'checkbox')
            if (selection_in_place()) change({ type: name, value: elem.checked });
        else
            if (selection_in_place()) change({ type: name, value: elem.value });
    };

export function drop_term_changers (): void {
    (document.getElementById('style-content') as HTMLFormElement).reset();
}

export function set_term_changers (classes: Array<string>): void {
    drop_term_changers();

    for (const cls of classes) {
        const term_changer = [...term_changers].filter((value: HTMLInputElement): boolean => {
            const name = cls.includes(SEPARATOR) ? cls.split(SEPARATOR)[0] : cls;
            return value.getAttribute('name') == name;
        });

        if (term_changer.length == 1) {
            const changer = term_changer[0] as HTMLInputElement;
            if (changer.getAttribute('type') == 'checkbox') changer.checked = true;
            else changer.value = cls.split(SEPARATOR)[1];
        } else term_changer.find((value: HTMLInputElement): boolean => {
            return value.value == cls.split(SEPARATOR)[1];
        }).checked = true;
    }
}
