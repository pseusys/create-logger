import {style, get_common_classes, get_collapse} from "./cutter";
import {get_focus, range_in_place, switch_mode, TERMINAL_STATE} from "./terminal";
import {CLASS_CODES, getPostfix, getPrefix, multiplePrefix, VAR_NAMES} from "../core/constants";
import {get, set} from "./storer";


function globalHandler (event: Event): void {
    const target = event.target as HTMLElement;
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return;
    let r = selection.getRangeAt(0);
    if (!range_in_place(r) && !!get_focus()) r = get_focus();

    if (target.classList.contains('term-changer') || target.classList.contains('preset-button')) {
        const range = focusedPreset ?? r;
        if (target.classList.contains('term-changer')) apply_style(range, target as HTMLInputElement);
        else apply_styles(range, target as HTMLButtonElement);

    } else if (target.classList.contains('preset-example')) {
        if (!!focusedPreset && (target.id == focusedPreset.id)) {
            savePreset(focusedPreset);
            focusedPreset = null;
        } else focusedPreset = target as HTMLDivElement;
        //TODO: add some css for focused preset.
        switch_mode(focusedPreset == null ? TERMINAL_STATE.STYLE : TERMINAL_STATE.FILE);
        reflect_selection(null, focusedPreset);

    } else if (target.classList.contains('variable')) {
        const field = event.target as HTMLInputElement;
        if (field.id == 'var-name') variables[1].disabled = (field.value == "");
        const collapse = get_collapse(r);
        if (!!collapse) collapse.setAttribute(VAR_NAMES[field.id], field.value);
    }
}

document.getElementById('style-content').onclick = globalHandler;



// Left section: styles controls.

const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLInputElement[];

export function reflect_selection (range?: Range, single?: HTMLDivElement) {
    drop_term_changers();
    if (!range != !single) {
        const classes = get_common_classes(range, single);
        if (!!classes) set_term_changers(classes);
    }
}

function apply_style (range: Range | HTMLDivElement, elem: HTMLInputElement): void {
    const name = elem.getAttribute('name');
    if (elem.getAttribute('type') == 'checkbox') style(range, { type: name, value: elem.checked });
    else style(range, { type: name, value: elem.value });
}

export function drop_term_changers (): void {
    (document.getElementById('style-content') as HTMLFormElement).reset();
}

export function set_term_changers (classes: string[]): void {
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



// Middle section: presets controls.

let focusedPreset: HTMLDivElement = null;

function apply_styles (range: Range | HTMLDivElement, elem: HTMLButtonElement): void {
    style(range, null);
    const temp = document.getElementById(elem.getAttribute('name')) as HTMLDivElement;
    [...temp.classList].forEach((value: string): void => {
        const type = getPrefix(value);
        if (multiplePrefix(type)) style(range, { type: type, value: getPostfix(value) });
        else style(range, { type: type, value: true });
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



// Right section: variable controls.

const variables = Object.keys(VAR_NAMES).map((value: string): HTMLInputElement => {
    const input = document.getElementById(value);
    input.oninput = globalHandler;
    return input as HTMLInputElement;
}) as HTMLInputElement[];

export function reflectVariable (range: Range): void {
    const collapse = get_collapse(range);
    dropVariables();
    if (!!collapse) {
        variables.forEach((value: HTMLInputElement): void => {
            value.value = collapse.getAttribute(VAR_NAMES[value.id]);
        });
        variables[0].disabled = false;
        variables[1].disabled &&= (variables[0].value.length == 0);
    }
}

function dropVariables (): void {
    variables.forEach((value: HTMLInputElement): void => {
        value.value = "";
        value.disabled = true;
    })
}
