import { get, set } from "./storer";
import { DEFAULTS, SEPARATOR } from "../core/constants";
import { terminal } from "./terminal";
import {log} from "./logger";



/**
 * Div, representing the tab and used to scope-out classes,
 */
const general_content = document.getElementById('general-content') as HTMLDivElement;

export const lang_chooser = document.getElementById("language") as HTMLSelectElement;
export const trans_chooser = document.getElementById("translation") as HTMLSelectElement;

const vars_check = document.getElementById("vars-check") as HTMLInputElement;
const readable_check = document.getElementById("readable-check") as HTMLInputElement;
const code_args = document.getElementById("code-args-input") as HTMLInputElement;



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

general_content.onclick = (event: MouseEvent) => {
    const target = event.target as HTMLSelectElement;
    if (target.classList.contains('term-changer')) set('term-' + target.getAttribute('name'), target.value);
    reflect_set();
}



function window_filename (): string {
    const path = window.location.pathname;
    return path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
}

const file_name = window_filename();
trans_chooser.value = ((file_name == 'index') || (file_name == '')) ? 'en' : file_name;



lang_chooser.onclick = () => {
    code_args._set(get(code_args_lang_key(), ""));
}

trans_chooser.onclick = () => {
    if (trans_chooser.value == 'en') window.location.replace('index.html?#GENERAL');
    else window.location.replace(trans_chooser.value + ".html?#GENERAL");
}



function code_args_lang_key () {
    return JSON.stringify({ lang: lang_chooser.value, args: code_args.id });
}

function setting_saver (event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.type == "checkbox") set(target.id, target.value);
    else set(code_args_lang_key(), target.value);
}



export function restore_settings () {
    vars_check._check(get(vars_check.id, false));
    vars_check.oninput = setting_saver;
    readable_check._check(get(readable_check.id, false));
    readable_check.oninput = setting_saver;
    code_args._set(get(code_args_lang_key(), ""));
    code_args.oninput = setting_saver;

    for (const changer of general_content.getElementsByClassName('term-changer')) {
        const ch = changer as HTMLSelectElement;
        const name = ch.getAttribute('name');
        ch.value = get('term-' + name, DEFAULTS[name]);
    }
}
