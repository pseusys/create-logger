import { get_chosen_line_content, terminal } from "./terminal";



// Range storing section.
/**
 * Interface, representing selected range in terminal in STYLE mode. Has following properties:
 * * collapse - boolean, set to true if start position of the range equals end position.
 * * single - styled span, containing start and end position of the range if they are situated inside of one span,
 * null otherwise.
 * * rect - positions of the range.
 * * (start, s_i_offset, s_p_offset) - start position of the range.
 *   * start - styled span, containing start position of the range.
 *   * s_i_offset - offset of the start position of the range from beginning of the start (in chars).
 *   * s_p_offset - offset of the start position of the range from beginning of the parent (in chars).
 * * (end, e_i_offset, e_p_offset) - end position of the range.
 *   * end - styled span, containing end position of the range.
 *   * s_i_offset - offset of the end position of the range from beginning of the end (in chars).
 *   * s_p_offset - offset of the end position of the range from beginning of the parent (in chars).
 * @see STYLE STYLE mode
 * @see terminal styled spans
 * @see ranger selected range
 */
class Ranger {
    collapse: boolean;
    single?: HTMLSpanElement;
    rect?: ClientRect;

    start: HTMLSpanElement;
    s_i_offset: number;
    s_p_offset: number;

    end: HTMLSpanElement;
    e_i_offset: number;
    e_p_offset: number;

    save = save;
    load = load;

    set_in_node = set_in_node;
    get_clear_text = get_clear_text;

    selection_in_place = selection_in_place;

    constructor () {
        this.collapse = false;
        this.single = null;
        this.rect = null;

        this.start = null;
        this.s_i_offset = -1;
        this.s_p_offset = -1;

        this.end = null;
        this.e_i_offset = -1;
        this.e_p_offset = -1;
    }
}

/**
 * Saved range, represents the last selection made in terminal even after focus moved to another element.
 */
export const ranger = new Ranger();

/**
 * Actual non-exported _Range_, underlying selected range.
 * @see ranger selected range
 */
let selected: Range = null;



// Range operations section.

/**
 * Function that parses current range, correcting internal offsets of range _in_ first and last styled span.
 * Especially it corrects range edges at position `0` and `node.text.length - 1`.
 * Node boundaries never begin at the end of the node or end at the beginning, even if user actually selected that.
 * @see terminal styled span
 * @param auto set only when saved inside window.onselectionchange method, may not reload range if nothing changed.
 * @return SpanEdges complete information about range inside line-content.
 */
function save (auto: boolean) {
    const selection = window.getSelection();

    if (auto && (selection.getRangeAt(0) == selected)) return;
    else selected = selection.getRangeAt(0);
    ranger.collapse = selection.isCollapsed;

    const parent = get_chosen_line_content();
    let first = selected._get_range_start_in_node(parent);
    let last = selected._get_range_end_in_node(parent);
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

        ranger.rect = (selected.getClientRects().length > 0) ? selected.getBoundingClientRect() : null;

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

/**
 * Function that loads changes made to selected range back into current range.
 * @see ranger selected range
 * @param selection_changed set if current selection has changed.
 */
function load (selection_changed: boolean) {
    if ((!selection_in_place() || !selection_changed) && range_in_place(selected)) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selected);
        selected._set_range_start_in_node(get_chosen_line_content(), ranger.s_p_offset);
        selected._set_range_end_in_node(get_chosen_line_content(), ranger.e_p_offset);
        save(false);
    }
}

/**
 * Function, setting collapsed range (= caret) to specified position (in chars) of given node.
 * @param node node to set caret into.
 * @param position position to set caret to.
 */
export function set_in_node (node: HTMLElement, position?: number) {
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
function get_clear_text (): string {
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



// Checking section.

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
function selection_in_place (): boolean {
    const selection = window.getSelection();
    if (selection.rangeCount == 0) return false;
    return range_in_place(selection.getRangeAt(0));
}



/**
 * Function to find the (parent) span corresponding to any selected node in terminal.
 * @throws DOMException if no span can be found for given element.
 * @param node given node.
 */
function find_span_for_place (node: Node): HTMLSpanElement {
    if ((node.nodeType == Node.TEXT_NODE) || (node.nodeName == "BR")) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLSpanElement;
}
