import './imports'

import {open_tab} from "./tabs";
import {choose_line, mode, save_focus, selection_in_place, terminal, TERMINAL_STATE} from "./terminal";
import {reflect_selection, reflectVariable, restorePresets} from "./style_tab";
import {check} from "./storer";


window.onload = () => {
    open_tab('style-tab', 'style-content');
    choose_line(terminal.firstElementChild);
    restorePresets();
    check();
}



document.ondragstart = (event) => {
    event.preventDefault();
    return false;
};

document.ondrop = (event) => {
    event.preventDefault();
    return false;
};



document.onselectionchange = () => {
    const selection = document.getSelection();
    if ((mode != TERMINAL_STATE.STYLE) || !selection_in_place(selection)) return;
    save_focus(selection);
    reflect_selection(selection.getRangeAt(0));
    reflectVariable(selection.getRangeAt(0));
}



document.oncopy = (event) => {
    const selection = document.getSelection();
    if (!!selection) {
        const str = document.getSelection().toString();
        const refined = str.replace(/\r?\n|\r/g, "").replace(/\u00a0/g, " ");
        event.clipboardData.setData('text/plain', refined);
        event.preventDefault();
    }
};
