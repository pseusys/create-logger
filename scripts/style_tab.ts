import { change, getCommonClasses } from "./cutter";
import { selection_in_place } from "./terminal";
import { getPostfix, getPrefix } from "../core/constants";

function apply_style (selection: Selection, elem: HTMLInputElement): void {
    const name = elem.getAttribute('name');
    if (elem.getAttribute('type') == 'checkbox')
        change(selection, {type: name, value: elem.checked});
    else change(selection, {type: name, value: elem.value});
}

function apply_styles (selection: Selection, elem: HTMLButtonElement): void {
}

document.getElementById('style-content').onclick = (event) => {
    const target = event.target as HTMLElement;

    if (target.classList.contains('term-changer') || target.classList.contains('preset_button')) {
        const selection = document.getSelection();
        if (selection.rangeCount > 0) {
            if (!selection_in_place(selection)) return;
            if (target.classList.contains('term-changer')) apply_style(selection, target as HTMLInputElement);
            else apply_styles(selection, target as HTMLButtonElement);
        }
    }
}



export function reflect_selection (selection: Selection, single?: Element) {
    const classes = getCommonClasses(selection, single);
    if (classes) set_term_changers(classes);
    else drop_term_changers();
}

const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLInputElement[];

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
