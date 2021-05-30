import { get, set } from "./storer";



export const lang_chooser = document.getElementById("language") as HTMLSelectElement;
export const trans_chooser = document.getElementById("translation") as HTMLSelectElement;

const vars_check = document.getElementById("vars-check") as HTMLInputElement;
const readable_check = document.getElementById("readable-check") as HTMLInputElement;
const code_args = document.getElementById("code-args-input") as HTMLInputElement;



function window_filename (): string {
    const path = window.location.pathname;
    return path.slice(path.lastIndexOf('/') + 1, path.lastIndexOf('.'));
}
const file_name = window_filename();
trans_chooser.value = (file_name == 'index') ? 'en' : file_name;



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
}
