import './imports'

import { drop_term_changers, open_tab, set_term_changers } from "./tabs";
import { choose_line, selection_in_place, terminal } from "./terminal";
import { getCommonClasses } from "./cutter";



window.onload = () => {
    open_tab('style-tab', 'style-content');
    choose_line(terminal.firstElementChild);
}



document.ondragstart = (event) => {
    event.preventDefault();
    return false;
};

document.ondrop = (event) => {
    event.preventDefault();
    return false;
};



document.onselectionchange = (event) => {
    if (!selection_in_place()) return;
    const classes = getCommonClasses();
    if (classes) set_term_changers(classes);
    else drop_term_changers();
}



document.oncopy = (event) => {
    const str = document.getSelection().toString();
    const refined = str.replace(/\r?\n|\r/g, "").replace(/\u00a0/g, " ");
    event.clipboardData.setData('text/plain', refined);
    event.preventDefault();
};
