import { style, get_common_classes, Formatting } from "./cutter";
import { switch_mode, TERMINAL_STATE } from "./terminal";
import { CLASS_CODES, getPostfix, getPrefix, multiplePrefix } from "../core/constants";
import { get, set } from "./storer";
import ranger from "./ranger";



/**
 * Div, representing the tab and used to scope-out classes.
 */
const style_content = document.getElementById('style-content') as HTMLDivElement;

/**
 * Style tab oninput handler. Click on 'term changer' applies connected style to currently selected element.
 * @see term_changers term changers
 * @param event input event.
 */
style_content.oninput = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('term-changer')) apply_style(target, focused_preset);
}

/**
 * Style tab onclick handler. Recognizes 2 types of click:
 * 1. Click on 'preset' applies connected styles to currently selected element.
 * 2. Click on 'preset button' to alter preset value.
 * @see focused_preset presets
 * @see save_preset preset button
 * @param event click event.
 */
style_content.onclick = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('preset-label')) apply_styles(target as HTMLSpanElement, focused_preset);
    else if (target.classList.contains('preset-button')) {
        const preset_target = target.parentElement.getElementsByClassName('preset-label')[0] as HTMLSpanElement;
        if (!!focused_preset && (preset_target.id != focused_preset.id)) return;
        target.parentElement.classList.toggle("focused", !focused_preset);
        switch_mode(!!focused_preset ? TERMINAL_STATE.STYLE : TERMINAL_STATE.GENERAL);
        if (!!focused_preset) {
            save_preset(focused_preset);
            focused_preset = null;
            reflect_variable();
            var_name._enable(true);
        } else {
            focused_preset = preset_target;
            reflect_term_changers(focused_preset);
            drop_variables();
            var_name._enable(false);
        }
    }
}



// Left section: styles controls.

/**
 * Array of 'term changers' - interface elements, representing all styles that can be handled.
 * Interacting with term changer leads to changing of style of selected text part.
 */
const term_changers = [...style_content.getElementsByClassName('term-changer')] as HTMLElement[];

/**
 * Function, called after 'term changer' was clicked. It applies term changer style to given element or selected range.
 * @see ranger selected range
 * @see term_changers term changer
 * @param acceptor element or range, to which style will be applied.
 * @param elem term changer, representing style, that will be applied.
 */
function apply_style (elem: HTMLElement, acceptor: HTMLSpanElement): void {
    const name = elem.getAttribute('name');
    if (elem.nodeName == "INPUT") {
        const check = elem as HTMLInputElement;
        if (check.getAttribute('type') == 'checkbox')
            style([{ type: name, value: check.checked }], acceptor);
        else style([{ type: name, value: check.value }], acceptor);
    } else {
        const sel = elem as HTMLSelectElement;
        if (sel.selectedIndex != 0) style([{ type: name, value: sel.value }], acceptor);
    }
}

/**
 * Function to set term changers to represent selected range or preset styles.
 * @see ranger selected range
 * @see term_changers term changers
 * @see focused_preset preset
 * @param single preset, that should be represented.
 */
export function reflect_term_changers (single?: HTMLSpanElement) {
    drop_term_changers();
    const classes = get_common_classes(single);
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
 * Function, called after 'preset' was clicked. It applies preset styles to given element or selected range.
 * @see ranger selected range
 * @see focused_preset preset
 * @param acceptor element or range, to which style will be applied.
 * @param elem term changer, representing style, that will be applied.
 */
function apply_styles (elem: HTMLElement, acceptor?: HTMLSpanElement): void {
    style(null, acceptor);
    const formats = [...elem.classList].filter((value: string): boolean => {
        return Object.keys(CLASS_CODES).includes(value);
    }).map((value: string): Formatting => {
        const type = getPrefix(value);
        if (multiplePrefix(type)) return { type: type, value: getPostfix(value) };
        else return { type: type, value: true };
    });
    style(formats, acceptor);
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
    [...style_content.getElementsByClassName('preset-label')].forEach((value: HTMLDivElement): void => {
        const savedValue = get(value.id, null);
        if (savedValue != null) value.className = savedValue;
    });
}



// Right section: variable controls.

/**
 * An object to attribute variable name and type controls (their ids) with classes they set.
 */
export const var_section_attribution = {
    "var-name-input": "data-var-name",
    "var-type-input": "data-var-type"
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
    const collapse = ranger.single;
    if (!!collapse && var_type.selectedIndex != 0) collapse.setAttribute(var_section_attribution[var_type.id], var_type.value);
    reflect_variable();
};

/**
 * Input element, representing variable name, and function called on input to this element.
 * Variable name may be set to every 'styled span' and is contained in special 'data-var-name' attribute.
 * Inputted whitespaces are omitted.
 * @see terminal styled span
 */
const var_name = document.getElementById("var-name-input") as HTMLInputElement;
var_name.oninput = () => {
    if (var_name.value.includes(' ')) var_name.value = var_name.value.replace(/ /g, '');
    const collapse = ranger.single;
    if (!!collapse) {
        collapse.setAttribute(var_section_attribution[var_name.id], var_name.value);
        if (var_name.value.length == 0) {
            collapse.removeAttribute(var_section_attribution[var_name.id]);
            collapse.removeAttribute(var_section_attribution[var_type.id]);
        }
    }
    reflect_variable();
};

/**
 * Function to set 'var name' and 'var type' to represent the only (!) selected range span.
 * @see ranger selected range
 * @see var_name var name
 * @see var_type var type
 */
export function reflect_variable (): void {
    const collapse = ranger.single;
    drop_variables();
    if (!!collapse) {
        const variable = collapse.getAttribute(var_section_attribution[var_name.id]) ?? "";
        if (variable.length != 0) {
            var_name._set(variable);
            var_type._enable(true);

            const type = collapse.getAttribute(var_section_attribution[var_type.id]) ?? "";
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
    var_name._enable(true);
    var_type._enable(false);
}
