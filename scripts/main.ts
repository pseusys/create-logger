import './imports'

import { open_tab, reflect_selection } from "./tabs";
import { choose_line, editable, selection_in_place, terminal } from "./terminal";



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



document.onselectionchange = () => {
    if (!editable || !selection_in_place()) return;
    reflect_selection();
}



document.oncopy = (event) => {
    const str = document.getSelection().toString();
    const refined = str.replace(/\r?\n|\r/g, "").replace(/\u00a0/g, " ");
    event.clipboardData.setData('text/plain', refined);
    event.preventDefault();
};
