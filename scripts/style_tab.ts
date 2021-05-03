import { style, get_common_classes, get_collapse } from "./cutter";
import { get_focus, switch_mode, TERMINAL_STATE } from "./terminal";
import { CLASS_CODES, getPostfix, getPrefix, multiplePrefix, VAR_NAMES } from "../core/constants";
import { get, set } from "./storer";



/**
 * Style tab onclick handler. Recognizes 2 types of click:
 * 1. Click on 'term changer' or 'preset', applies given style (or styles) connected to currently selected element.
 * 2. Click on 'preset button' to alter preset value.
 * @see term_changers term changers
 * @see focused_preset presets
 * @see save_preset preset button
 * @param event click event.
 */
document.getElementById('style-content').onclick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (target.classList.contains('term-changer') || target.classList.contains('preset-label')) {
        const acceptor = focused_preset ?? get_focus();
        if (target.classList.contains('term-changer')) apply_style(acceptor, target);
        else apply_styles(acceptor, target as HTMLSpanElement);

    } else if (target.classList.contains('preset-button')) {
        const preset_target = target.parentElement.getElementsByClassName('preset-label')[0] as HTMLSpanElement;
        if (!!focused_preset && (preset_target.id != focused_preset.id)) return;
        target.parentElement.classList.toggle("focused", !focused_preset);
        switch_mode(!!focused_preset ? TERMINAL_STATE.STYLE : TERMINAL_STATE.GENERAL);
        if (!!focused_preset) {
            save_preset(focused_preset);
            focused_preset = null;
        } else {
            focused_preset = preset_target;
            reflect_term_changers(null, focused_preset);
        }
    }
}



// Left section: styles controls.

/**
 * Array of 'term changers' - interface elements, representing all styles that can be handled.
 * Interacting with term changer leads to changing of style of selected text part.
 */
const term_changers = [...document.getElementsByClassName('term-changer')] as HTMLElement[];

/**
 * Function, called after 'term changer' was clicked. It applies term changer style to given element or range.
 * @see term_changers term changer
 * @param acceptor element or range, to which style will be applied.
 * @param elem term changer, representing style, that will be applied.
 */
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

/**
 * Function to set term changers to represent selected text or preset styles.
 * @see term_changers term changers
 * @see focused_preset preset
 * @param range selected text, that should be represented.
 * @param single preset, that should be represented.
 */
export function reflect_term_changers (range?: Range, single?: HTMLSpanElement) {
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

/**
 * Function to reset 'term changers' to their default values.
 * @see term_changers term changers
 */
export function drop_term_changers (): void {
    (document.getElementById('colors-tab') as HTMLFormElement).reset();
    [...term_changers].forEach((value: HTMLElement) => {
        if (value.nodeName == "INPUT") (value as HTMLInputElement)._check(false);
    });
}



// Middle section: presets controls.

/**
 * Preset, that is currently focused to change.
 * Preset is a stylable span outside of terminal, may be considered as a combination of term changers.
 * @see term_changers term changers
 */
let focused_preset: HTMLSpanElement = null;

/**
 * Function, called after 'preset' was clicked. It applies preset styles to given element or range.
 * @see focused_preset preset
 * @param acceptor element or range, to which style will be applied.
 * @param elem term changer, representing style, that will be applied.
 */
function apply_styles (acceptor: Range | HTMLSpanElement, elem: HTMLElement): void {
    style(acceptor, null);
    [...elem.classList].forEach((value: string): void => {
        if (!Object.keys(CLASS_CODES).includes(value)) return;
        const type = getPrefix(value);
        if (multiplePrefix(type)) style(acceptor, { type: type, value: getPostfix(value) });
        else style(acceptor, { type: type, value: true });
    });
}

/**
 * Function to save preset styles to cookies. Presets may be altered after 'preset button' is clicked.
 * During alteration terminal goes into 'GENERAL' mode.
 * Their value is saved after button is clicked for the second time.
 * @see TERMINAL_STATE terminal mode
 * @param preset preset to save value.
 */
function save_preset (preset: HTMLSpanElement): void {
    set(preset.id, preset.className);
}

/**
 * Function, loading preset values from cookies. Called once on window loaded.
 * @see focused_preset presets
 */
export function restore_presets () {
    [...document.getElementsByClassName('preset-label')].forEach((value: HTMLDivElement): void => {
        const savedValue = get(value.id) as string;
        if (!!savedValue) value.className = savedValue;
    });
}



// Right section: variable controls.

/**
 * Input element, representing variable name, and function called on input to this element.
 * Variable name may be set to every 'styled span' and is contained in special 'data-var-name' attribute.
 * @see terminal styled span
 */
const var_name = document.getElementById("var-name-input") as HTMLInputElement;
var_name.oninput = () => {
    const collapse = get_collapse(get_focus());
    if (!!collapse) {
        collapse.setAttribute(VAR_NAMES[var_name.id], var_name.value);
        if (var_name.value.length == 0) collapse.setAttribute(VAR_NAMES["var-type-input"], "");
    }
    reflect_variable(get_focus());
};

/**
 * Input element, representing variable type, and function called on input to this element.
 * Variable type may be set to 'styled span' with 'var name' and is contained in special 'data-var-type' attribute.
 * If span has no 'var name', this element is automatically cleared and disabled.
 * @see var_name var name
 * @see terminal styled span
 */
const var_type = document.getElementById("var-type-input") as HTMLSelectElement;
var_type.oninput = () => {
    const collapse = get_collapse(get_focus());
    if (!!collapse && var_type.selectedIndex != 0) collapse.setAttribute(VAR_NAMES[var_type.id], var_type.value);
    reflect_variable(get_focus());
};

/**
 * Function to set 'var name' and 'var type' to represent selected span.
 * @see var_name var name
 * @see var_type var type
 */
export function reflect_variable (range: Range): void {
    const collapse = get_collapse(range);
    drop_variables();

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

/**
 * Function to reset 'var name' and 'var type' to none.
 * @see var_name var name
 * @see var_type var type
 */
function drop_variables (): void {
    (document.getElementById('variables-tab') as HTMLFormElement).reset();
    var_name._set("");
    var_name._enable(true);
    var_type._enable(false);
}
