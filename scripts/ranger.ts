import { find_span_for_place, get_chosen_line_content, range_in_place, selection_in_place } from "./terminal";

interface Ranger {
    range: Range;
    collapse: HTMLSpanElement;

    start: HTMLSpanElement;
    s_i_offset: number;
    s_p_offset: number;

    end: HTMLSpanElement;
    e_i_offset: number;
    e_p_offset: number;
}

/**
 * Saved range, represents the last selection made in terminal even after focus moved to another element.
 * Used with styling methods, especially if styling controls (e.g. input text - variable name) gets focused.
 */
export const ranger: Ranger = {
    range: null,
    collapse: null,

    start: null,
    s_i_offset: -1,
    s_p_offset: -1,

    end: null,
    e_i_offset: -1,
    e_p_offset: -1
};



/**
 * Function that parses range, correcting internal offsets of range _in_ first and last styled span.
 * Especially it corrects range edges at position `0` and `node.text.length - 1`.
 * Node boundaries never begin at the end of the node or end at the beginning, even if user actually selected that.
 * @see terminal styled span
 * @return SpanEdges complete information about range inside line-content.
 */
export function save (auto: boolean) {
    const selection = window.getSelection();

    if (auto && (selection.getRangeAt(0) == ranger.range)) return;
    else ranger.range = selection.getRangeAt(0);
    console.log("auto saved " + auto);

    const parent = get_chosen_line_content();
    let first = ranger.range._get_range_start_in_node(parent);
    let last = ranger.range._get_range_end_in_node(parent);
    ranger.s_p_offset = first.offset;
    ranger.e_p_offset = last.offset;

    let first_node = find_span_for_place(first.node);
    let first_offset = first.node_offset;
    let last_node = find_span_for_place(last.node);
    let last_offset = last.node_offset;

    const set = () => {
        ranger.start = first_node;
        ranger.s_i_offset = first_offset;
        ranger.end = last_node;
        ranger.e_i_offset = last_offset;

        if (first_node == last_node) ranger.collapse = first_node;
        else ranger.collapse = null;
    };

    if (first_node == last_node) {
        set();
        return;
    }

    if ((first_offset == first_node.textContent.length) && (first_node.nextElementSibling != null)) {
        first_node = first_node.nextElementSibling as HTMLSpanElement;
        first_offset = 0;
    }
    if (first_node == last_node) {
        set();
        return;
    }

    if ((last_offset == 0) && (last_node.previousElementSibling != null)) {
        last_node = last_node.previousElementSibling as HTMLSpanElement;
        last_offset = last_node.textContent.length;
    }

    set();
}

export function load (selection_changed: boolean) {
    const selection = window.getSelection();
    if ((!selection_in_place(selection) || !selection_changed) && range_in_place(ranger.range)) {
        console.log("selection returned fix")
        selection.removeAllRanges();
        selection.addRange(ranger.range);
        ranger.range._set_range_start_in_node(get_chosen_line_content(), ranger.s_p_offset);
        ranger.range._set_range_end_in_node(get_chosen_line_content(), ranger.e_p_offset);
        save(false);
    }
}

export function set_in_node (node: HTMLElement, position: number) {
    const range = document.createRange();
    range._set_range_in_node(node, position);
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}
