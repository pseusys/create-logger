import { style, get_common_classes, get_collapse } from "./cutter";
import { get_focus, switch_mode, TERMINAL_STATE } from "./terminal";
import { CLASS_CODES, getPostfix, getPrefix, multiplePrefix, VAR_NAMES } from "../core/constants";
import { get, set } from "./storer";



document.getElementById('style-content').onclick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return;

    if (target.classList.contains('term-changer') || target.classList.contains('preset-label')) {
        const acceptor = focusedPreset ?? get_focus();
        if (target.classList.contains('term-changer')) apply_style(acceptor, target);
        else apply_styles(acceptor, target as HTMLSpanElement);

    } else if (target.classList.contains('preset-button')) {
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

function apply_style (acceptor: Range | HTMLSpanElement, elem: HTMLElement): void {
    const name = elem.getAttribute('name');
    if (elem.nodeName == "INPUT") {
        const check = elem as HTMLInputElement;
        if (check.getAttribute('type') == 'checkbox') style(acceptor, { type: name, value: check.checked });
        else style(acceptor, { type: name, value: check.value });
    } else {
        const sel = elem as HTMLSelectElement;
        if (sel.selectedIndex != 0) style(acceptor, { type: name, value: sel.value });
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
            if (term_changer[0].getAttribute('type') == 'checkbox') term_changer[0]._check(true);
            else term_changer[0].value = getPostfix(cls);
        } else term_changer.find((value: HTMLInputElement): boolean => {
            return value.value == getPostfix(cls);
        })._check(true);
    }
}

export function drop_term_changers (): void {
    (document.getElementById('colors-tab') as HTMLFormElement).reset();
    [...term_changers].forEach((value: HTMLElement) => {
        if (value.nodeName == "INPUT") (value as HTMLInputElement)._check(false);
    });
}



// Middle section: presets controls.

let focusedPreset: HTMLDivElement = null;

function apply_styles (acceptor: Range | HTMLSpanElement, elem: HTMLElement): void {
    style(acceptor, null);
    [...elem.classList].forEach((value: string): void => {
        if ((value == "preset-label") || (value == 'mdl-chip__text')) return;
        const type = getPrefix(value);
        if (multiplePrefix(type)) style(acceptor, { type: type, value: getPostfix(value) });
        else style(acceptor, { type: type, value: true });
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
        if (var_name.value.length == 0) collapse.setAttribute(VAR_NAMES["var-type-input"], "");
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
        if (variable.length != 0) {
            var_name._set(variable);
            var_type._enable(true);

            const type = collapse.getAttribute(VAR_NAMES[var_type.id]) ?? "";
            if (type.length != 0) var_type.value = type;
        }
    } else var_name._enable(false);
}

function dropVariables (): void {
    (document.getElementById('variables-tab') as HTMLFormElement).reset();
    var_name._set("");
    var_name._enable(true);
    var_type._enable(false);
}
