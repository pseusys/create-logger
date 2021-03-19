import './imports'

import {open_tab} from "./tabs";
import {choose_line, getClearText, mode, reflect_nodes, selection_in_place, terminal, TERMINAL_STATE} from "./terminal";
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
    const range = selection.getRangeAt(0);
    reflect_nodes(range);
    reflect_selection(range);
    reflectVariable(range);
}



document.oncopy = (event) => {
    const selection = document.getSelection();
    if (!!selection) {
        const str = getClearText(selection.getRangeAt(0));
        const refined = str.replace(/\u00a0/g, " ");
        event.clipboardData.setData('text/plain', refined);
        event.preventDefault();
    }
};

document.onpaste = (event) => {
    const selection = document.getSelection();
    if (!!selection && selection.isCollapsed) {
        const str = event.clipboardData.getData('text/plain');
        const refined = str.replace(/\r?\n|\r/g, "");
        const range = selection.getRangeAt(0);
        const text = range.commonAncestorContainer;
        const offset = range._getRangeStartInNode(text).offset;
        text.textContent = text.textContent.slice(0, offset) + refined + text.textContent.slice(offset);
    }
    event.preventDefault();
}
