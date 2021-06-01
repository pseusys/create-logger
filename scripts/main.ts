import "./imports"

import { choose_line, mode, reflect_nodes, switch_mode, terminal, TERMINAL_STATE } from "./terminal";
import { reflect_term_changers, reflect_variable, restore_presets } from "./style_tab";
import { check } from "./storer";
import { ranger } from "./ranger";
import { restore_settings } from "./general_tab";



/**
 * On window loaded handler. It opens styles tab, switching terminal to STYLE mode and choosing first line.
 * It also verifies if cookies are allowed and restores presets if any.
 * @see terminal terminal
 * @see STYLE STYLE mode
 */
window.onload = () => {
    restore_settings();
    restore_presets();
    switch_mode(TERMINAL_STATE.STYLE);
    choose_line(terminal.firstElementChild as HTMLDivElement);
    check();
}



/**
 * Document on drag handlers, they prevent unintentional copy and pasting.
 * @param event event to discard.
 */
document.ondragstart = (event) => {
    event.preventDefault();
    return false;
};

/**
 * Same as above.
 * @param event
 */
document.ondrop = (event) => {
    event.preventDefault();
    return false;
};



/**
 * Document on selection changed handler. If something was selected in terminal in STYLE mode, it:
 * - Applies css to selected nodes and saves selection.
 * - Reflects common formatting of nodes on term changers.
 * - Reflects variable name and class of selected node (if one selected).
 * @see terminal terminal
 * @see STYLE STYLE mode
 * @see reflect_nodes selecting nodes
 * @see reflect_term_changers term changers
 * @see reflect_variable reflect variable
 */
document.onselectionchange = () => {
    if ((mode != TERMINAL_STATE.STYLE) || !ranger.selection_in_place()) return;
    ranger.save(true);
    reflect_nodes();
    reflect_term_changers();
    reflect_variable();
}



/**
 * Document on copy handler. It prevents user from copying html marked-down text.
 * It also replaces special symbols with common ones.
 * @param event copy event.
 */
document.oncopy = (event) => {
    const str = ranger.get_clear_text();
    const refined = str.replace(/\u00a0/g, " ");
    event.clipboardData.setData('text/plain', refined);
    event.preventDefault();
};

/**
 * Document on paste handler. It tries to keep terminal structure on paste.
 * It does not allow pasting if range is not collapsed and adds pasted text to current formatting.
 * It also replaces special symbols with common ones.
 * @see terminal terminal
 * @param event copy event.
 */
document.onpaste = (event) => {
    const selection = document.getSelection();
    if (!!selection && selection.isCollapsed) {
        const str = event.clipboardData.getData('text/plain');
        const refined = str.replace(/\r?\n|\r/g, "");

        const range = selection.getRangeAt(0);
        const text = range.commonAncestorContainer;
        const offset = range._get_range_start_in_node(text).offset;

        if (text.nodeType != Node.TEXT_NODE)
            throw new DOMException("Paste into non-text node: " + text.nodeName);

        text.textContent = text.textContent.slice(0, offset) + refined + text.textContent.slice(offset);
        range.setStart(text, offset);
        range.setEnd(text, refined.length + offset);
    }
    event.preventDefault();
}



function tab_callback (current_tab: HTMLAnchorElement) {
    const href = current_tab.href.split('#').pop();

    [...document.getElementsByClassName('mdl-layout__tab')].forEach((value: HTMLAnchorElement) => {
        value.classList.remove('is-active');
    });
    [...document.getElementsByClassName('mdl-layout__tab-panel')].forEach((value: HTMLAnchorElement) => {
        value.classList.remove('is-active');
    });
    current_tab.classList.add('is-active');
    document.getElementById(href).classList.add('is-active');

    const tabs = document.getElementById("tabs");
    if (current_tab.classList.contains("collapsing")) tabs.style.display = 'none';
    else tabs.style.display = '';

    switch_mode(TERMINAL_STATE[href]);
}

[...document.getElementsByClassName('mdl-layout__tab')].forEach((value: HTMLAnchorElement) => {
    value.onclick = () => { tab_callback(value); }
});
