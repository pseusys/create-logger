import { get, set } from "./storer";
import { DEFAULTS, SEPARATOR } from "../core/constants";
import { terminal } from "./terminal";
import { DEF_LANG, info } from "../core/langs";
import { log } from "./logger";



/**
 * Div, representing the tab and used to scope-out classes.
 */
const general_content = document.getElementById('general-content') as HTMLDivElement;

/**
 * Select tags, specifying code language (id = `language`) and translation (id = `translation`).
 */
const lang_chooser = document.getElementById("language") as HTMLSelectElement;
const trans_chooser = document.getElementById("translation") as HTMLSelectElement;

/**
 * Settings buttons, controlling whether variables names should be used in preview instead of var contents (id = `vars-check`)
 * and whether generated code should be styled to be easily read by user (id = `readable-check`).
 * @see Settings readable-check
 */
const vars_check = document.getElementById("vars-check") as HTMLInputElement;
const readable_check = document.getElementById("readable-check") as HTMLInputElement;

/**
 * Code args controls, text input field, used to pass keys and values to code generating plugins (id = `code-args-input`),
 * and button, showing allowed keys and values (id = `code-args-info`).
 * @see Settings code-args-input
 * @see Constructor code-args-info
 */
const code_args = document.getElementById("code-args-input") as HTMLInputElement;
const lang_chooser_info = document.getElementById("code-args-info") as HTMLButtonElement;



/**
 * Function, setting default terminal theme (black background and white foreground) for preview and code tabs.
 */
export function reflect_defaults () {
    for (const def in DEFAULTS) {
        const same_class = [...terminal.classList].find((value: string): boolean => {
            return value.startsWith(def);
        });
        const new_class = def + SEPARATOR + DEFAULTS[def];
        if (!!same_class) terminal.classList.replace(same_class, new_class);
        else terminal.classList.add(new_class);
    }
}

/**
 * Function, setting custom terminal theme (background and foreground) for general and style tabs.
 */
export function reflect_set () {
    for (const changer of general_content.getElementsByClassName('term-changer')) {
        const ch = changer as HTMLSelectElement;
        const name = ch.getAttribute('name');
        const new_name = name + SEPARATOR + ch.value;
        const same_class = [...terminal.classList].find((value: string): boolean => {
            return value.startsWith(name);
        });
        if (!!same_class) terminal.classList.replace(same_class, new_name);
        else terminal.classList.add(same_class, new_name);
    }
}

/**
 * Function, creating storing key for general tab term-changers (foreground and background colors).
 * @see set storing
 */
function term_name (name: string): string {
    return `term-${name}`;
}

/**
 * General tab oninput handler. Stores and reflects general tab term-changers.
 * @see term_name term-changers
 * @param event input event.
 */
general_content.oninput = (event: MouseEvent) => {
    const target = event.target as HTMLSelectElement;
    if (target.classList.contains('term-changer')) {
        set(term_name(target.getAttribute('name')), target.value);
        reflect_set();
    }
}



/**
 * Function, getting name of current html file.
 */
function window_filename (): string {
    const path = window.location.pathname;
    return path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
}

/**
 * Code, setting appropriate language tag to translation chooser on page load.
 * @see trans_chooser translation changer
 */
const file_name = window_filename();
trans_chooser.value = ((file_name == 'index') || (file_name == '')) ? 'en' : file_name;

/**
 * Translation chooser oninput handler.
 * Sets html file depending on chosen language tag.
 * Regularly, the file has the same name, except for english version, which is on index.html.
 */
trans_chooser.oninput = () => {
    if (trans_chooser.value == 'en') window.location.replace('index.html?#GENERAL');
    else window.location.replace(`${trans_chooser.value}.html?#GENERAL"`);
}



/**
 * Language chooser oninput handler. Saves chosen language and also loads code args for chosen language.
 * @see code_args_lang_key code args for language
 */
lang_chooser.oninput = () => {
    set(lang_chooser.id, lang_chooser.value);
    const args = get(code_args_lang_key(), "");
    code_args._set(args);
    set(code_args.id, args);
}

/**
 * Language chooser info oninput handler. Shows code args toast for chosen language.
 * Shows 'no args available' if no args for given language were specified.
 * @see info code args for chosen language
 */
lang_chooser_info.onclick = () => {
    log(info(get("language", DEF_LANG)) ?? 'no args available');
}



/**
 * Function, creating storing key for code args text input field depending on currently chosen code language.
 */
function code_args_lang_key () {
    return JSON.stringify({ lang: lang_chooser.value, args: code_args.id });
}

/**
 * Function, saving value of given control element (checkbox or code args text input field).
 * @param event input event.
 */
function setting_saver (event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.type == "checkbox") set(target.id, target.checked);
    else {
        set(code_args_lang_key(), target.value);
        set(code_args.id, target.value);
    }
}



/**
 * Function to reflect general tab settings: term-changers, settings buttons and code args input.
 * @see term_name term-changers
 */
export function restore_settings () {
    lang_chooser.value = get(lang_chooser.id, DEF_LANG);

    vars_check._check(get(vars_check.id, false));
    vars_check.oninput = setting_saver;
    readable_check._check(get(readable_check.id, true));
    readable_check.oninput = setting_saver;
    code_args._set(get(code_args_lang_key(), ""));
    code_args.oninput = setting_saver;

    for (const changer of general_content.getElementsByClassName('term-changer')) {
        const ch = changer as HTMLSelectElement;
        const name = ch.getAttribute('name');
        ch.value = get(term_name(name), DEFAULTS[name]);
    }
}
