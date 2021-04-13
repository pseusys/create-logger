import { style, get_common_classes, get_collapse } from "./cutter";
import { get_focus, switch_mode, TERMINAL_STATE } from "./terminal";
import { CLASS_CODES, getPostfix, getPrefix, multiplePrefix, VAR_NAMES } from "../core/constants";
import { get, set } from "./storer";



document.getElementById('style-content').onclick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return;

    if (target.classList.contains('term-changer') || target.classList.contains('preset-button')) {
        const range = focusedPreset ?? get_focus();
        if (target.classList.contains('term-changer')) apply_style(range, target);
        else apply_styles(range, target as HTMLButtonElement);

    } else if (target.classList.contains('preset-example')) {
        if (!!focusedPreset && (target.id == focusedPreset.id)) {
            savePreset(focusedPreset);
            focusedPreset = null;
        } else focusedPreset = target as HTMLDivElement;
        switch_mode(focusedPreset == null ? TERMINAL_STATE.STYLE : TERMINAL_STATE.GENERAL);
        reflect_term_changers(null, focusedPreset);
    }
}



// Left section: styles controls.

const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLElement[];

function apply_style (range: Range | HTMLDivElement, elem: HTMLElement): void {
    const name = elem.getAttribute('name');
    if (elem.nodeName == "INPUT") {
        const check = elem as HTMLInputElement;
        if (check.getAttribute('type') == 'checkbox') style(range, { type: name, value: check.checked });
        else style(range, { type: name, value: check.value });
    } else {
        const sel = elem as HTMLSelectElement;
        if (sel.selectedIndex != 0) style(range, { type: name, value: sel.value });
    }
}

export function reflect_term_changers (range?: Range, single?: HTMLDivElement) {
    drop_term_changers();
    if (!range == !single) return;

    const classes = get_common_classes(range, single);
    if (!!classes) for (const cls of classes) {
        if (!Object.keys(CLASS_CODES).includes(cls)) continue;
        const term_changer = [...term_changers].filter((value: HTMLElement): boolean => {
            return value.getAttribute('name') == getPrefix(cls);
        }) as HTMLInputElement[];

        if (term_changer.length == 1) {
            if (term_changer[0].getAttribute('type') == 'checkbox') set_checkbox(term_changer[0], true);
            else term_changer[0].value = getPostfix(cls);
        } else set_checkbox(term_changer.find((value: HTMLInputElement): boolean => {
            return value.value == getPostfix(cls);
        }), true);
    }
}

export function drop_term_changers (): void {
    (document.getElementById('colors-tab') as HTMLFormElement).reset();
    [...term_changers].forEach((value: HTMLElement) => {
        if (value.nodeName == "INPUT") set_checkbox(value as HTMLInputElement, false);
    });
}

function set_checkbox (checkbox: HTMLInputElement, value: boolean) { // TO LIB
    checkbox.parentElement.classList.toggle('is-checked', value);
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

const var_name = document.getElementById("var-name-input") as HTMLInputElement;
var_name.oninput = () => {
    const collapse = get_collapse(get_focus());
    if (!!collapse) {
        collapse.setAttribute(VAR_NAMES[var_name.id], var_name.value);
        if (var_name.value == "") collapse.setAttribute(VAR_NAMES["var-type-input"], "");
    }
    reflectVariable(get_focus());
};
const var_type = document.getElementById("var-type-input") as HTMLSelectElement;
var_type.oninput = () => {
    const collapse = get_collapse(get_focus());
    if (!!collapse && var_type.selectedIndex != 0) collapse.setAttribute(VAR_NAMES[var_type.id], var_type.value);
    reflectVariable(get_focus());
};

export function reflectVariable (range: Range): void {
    const collapse = get_collapse(range);
    dropVariables();
    if (!!collapse) {
        const variable = collapse.getAttribute(VAR_NAMES[var_name.id]) ?? "";
        const is_disabled = (variable.length == 0);
        if (!is_disabled) {
            var_name.value = variable;
            var_name.parentElement.classList.add('is-dirty');

            var_type.disabled = false;
            var_type.parentElement.classList.remove('is-disabled');

            const type = collapse.getAttribute(VAR_NAMES[var_type.id]) ?? "";
            const is_untyped = (type.length == 0);
            if (!is_untyped) var_type.value = type;
        }
    } else {
        var_name.disabled = true;
        var_name.parentElement.classList.add('is-disabled');
    }
}

function dropVariables (): void {
    var_name.value = "";
    var_name.parentElement.classList.remove('is-dirty');
    var_name.disabled = false;
    var_name.parentElement.classList.remove('is-disabled');

    (document.getElementById('variables-tab') as HTMLFormElement).reset();
    var_type.disabled = true;
    var_type.parentElement.classList.add('is-disabled');
}
