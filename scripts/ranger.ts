import { find_span_for_place, get_chosen_line_content, terminal } from "./terminal";

interface Ranger {
    range: Range;
    collapse: boolean;
    single: HTMLSpanElement;

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
    collapse: false,
    single: null,

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
    ranger.collapse = selection.isCollapsed;

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

        if (first_node == last_node) ranger.single = first_node;
        else ranger.single = null;
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
    if ((!selection_in_place() || !selection_changed) && range_in_place(ranger.range)) {
        const selection = window.getSelection();
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



// Getting text section.

/**
 * Function to get text in given range. It extracts text from line-contents only.
 */
export function getClearText(): string {
    const range = window.getSelection().getRangeAt(0);
    return [...terminal.childNodes].reduce((previous: string, line: HTMLDivElement): string => {
        const content = line.lastElementChild;
        if (range.intersectsNode(content)) {
            let text = content.textContent;
            const start = range._get_range_start_in_node(content)?.offset ?? 0;
            const end = range._get_range_end_in_node(content)?.offset ?? text.length;
            return previous + text.substring(start, end) + '\n';
        } else return previous;
    }, "");
}



/**
 * Function checking if given range is a 'terminal selection' - a valid selection af some part of single
 * line-content, to witch any formatting may be applied.
 * @param range range to check.
 */
function range_in_place (range: Range): boolean {
    if (!range) return false;
    const selectionParent = range.commonAncestorContainer;
    const chosen = get_chosen_line_content();
    if (!chosen) return false;
    else return get_chosen_line_content().contains(selectionParent);
}

/**
 * Function to check if given selection is a 'terminal selection'.
 * @see range_in_place terminal selection
 */
export function selection_in_place (): boolean {
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return false;
    return range_in_place(selection.getRangeAt(0));
}
