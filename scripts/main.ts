import "./imports"

import { open_tab } from "./tabs";
import { choose_line, getClearText, mode, reflect_nodes, selection_in_place, terminal, TERMINAL_STATE } from "./terminal";
import { reflect_term_changers, reflectVariable, restorePresets } from "./style_tab";
import { check } from "./storer";



/**
 * On window loaded handler. It opens styles tab, switching terminal to STYLE mode and choosing first line.
 * It also verifies if cookies are allowed and restores presets if any.
 * @see terminal terminal
 * @see STYLE STYLE mode
 */
window.onload = () => {
    open_tab('style-tab', 'style-content');
    choose_line(terminal.firstElementChild as HTMLDivElement);
    check();
    restorePresets();
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
 * @see reflectVariable reflect variable
 */
document.onselectionchange = () => {
    const selection = document.getSelection();
    if ((mode != TERMINAL_STATE.STYLE) || !selection_in_place(selection)) return;
    const range = selection.getRangeAt(0);
    reflect_nodes(range);
    reflect_term_changers(range);
    reflectVariable(range);
}



/**
 * Document on copy handler. It prevents user from copying html marked-down text.
 * It also replaces special symbols with common ones.
 * @param event copy event.
 */
document.oncopy = (event) => {
    const selection = document.getSelection();
    if (!!selection) {
        const str = getClearText(selection.getRangeAt(0));
        const refined = str.replace(/\u00a0/g, " ");
        event.clipboardData.setData('text/plain', refined);
        event.preventDefault();
    }
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
