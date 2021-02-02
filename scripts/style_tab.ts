import { style, getCommonClasses } from "./cutter";
import { selection_in_place, switchMode, TERMINAL_STATE } from "./terminal";
import { CLASS_CODES, getPostfix, getPrefix, multiplePrefix } from "../core/constants";
import {get, set} from "./storer";


document.getElementById('style-content').onclick = (event) => {
    const target = event.target as HTMLElement;

    if (target.classList.contains('term-changer') || target.classList.contains('preset-button')) {
            const selection = focusedPreset ?? document.getSelection();
            if (selection instanceof Selection)
                if (!selection_in_place(selection) || (selection.rangeCount == 0)) return;
            if (target.classList.contains('term-changer')) apply_style(selection, target as HTMLInputElement);
            else apply_styles(selection, target as HTMLButtonElement);

    } else if (target.classList.contains('preset-example')) {
        if (!!focusedPreset && (target.id == focusedPreset.id)) {
            savePreset(focusedPreset);
            focusedPreset = null;
        } else focusedPreset = target as HTMLDivElement;
        //TODO: add some css for focused preset.
        switchMode(focusedPreset == null ? TERMINAL_STATE.STYLE : TERMINAL_STATE.FILE);
        reflect_selection(null, focusedPreset);
    }
}



// Left section: styles controls.

const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLInputElement[];

export function reflect_selection (selection?: Selection, single?: HTMLDivElement) {
    if (!selection == !single) drop_term_changers();
    else {
        const classes = getCommonClasses(selection, single);
        if (!!classes) set_term_changers(classes);
        else drop_term_changers();
    }
}

function apply_style (selection: Selection | HTMLDivElement, elem: HTMLInputElement): void {
    const name = elem.getAttribute('name');
    if (elem.getAttribute('type') == 'checkbox')
        style(selection, { type: name, value: elem.checked });
    else style(selection, { type: name, value: elem.value });
}

export function drop_term_changers (): void {
    (document.getElementById('style-content') as HTMLFormElement).reset();
}

export function set_term_changers (classes: string[]): void {
    drop_term_changers();

    for (const cls of classes) {
        if (!Object.keys(CLASS_CODES).includes(cls)) continue;
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



// Middle section: presets controls:

let focusedPreset: HTMLDivElement = null;

function apply_styles (selection: Selection | HTMLDivElement, elem: HTMLButtonElement): void {
    style(selection, null);
    const temp = document.getElementById(elem.getAttribute('name')) as HTMLDivElement;
    [...temp.classList].forEach((value: string): void => {
        const type = getPrefix(value);
        if (multiplePrefix(type)) style(selection, { type: type, value: getPostfix(value) });
        else style(selection, { type: type, value: true });
    });
}

function savePreset (preset: HTMLDivElement): void {
    set(preset.id, preset.className);
}

export function restorePresets () {
    [...document.getElementsByClassName('preset-example')].forEach((value: HTMLDivElement): void => {
        const savedValue = get(value.id) as string;
        if (!!savedValue) value.className = savedValue;
    });
}
