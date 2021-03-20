import { DEFAULTS, getPrefix, multiplePrefix, SEPARATOR, VAR_NAMES } from "../core/constants";
import { areArraysEqual, getSameElements } from "../core/utils";
import { find_span_for_place, get_chosen_line_content, terminal } from "./terminal";
import { restorePresets } from "./style_tab";



// Range parsing & restoring section.

/**
 * Type representing range inside a line-content (range containing multiple span elements only). Params:
 * + `first` - first node of the range.
 * + `last` - last node of the range.
 * + `first_offset` - offset inside first node (first offset).
 * + `last_offset` - offset inside last node (last offset).
 */
type SpanEdges = { first: HTMLSpanElement, last: HTMLSpanElement, first_offset: number, last_offset: number };

/**
 * Container for range offsets from the beginning of current line-content.
 * Used to restore range after nodes get cut and merged.
 */
let range_backup: { start: number, end: number };


/**
 * Function that parses range, correcting internal offsets of range _in_ first and last styled span.
 * Especially it corrects range edges at position `0` and `node.text.length - 1`.
 * Node boundaries never begin at the end of the node or end at the beginning, even if user actually selected that.
 * @see terminal styled span
 * @param range range to parse
 * @param backup if true, back given range up to restore it after cutting and joining.
 * @return SpanEdges complete information about range inside line-content.
 */
function parse_range (range: Range, backup: boolean): SpanEdges {
    const parent = get_chosen_line_content();
    let first = range._getRangeStartInNode(parent);
    let last = range._getRangeEndInNode(parent);
    if (backup) range_backup = { start: first.offset, end: last.offset };

    let first_node = find_span_for_place(first.node);
    let first_offset = first.node_offset;
    let last_node = find_span_for_place(last.node);
    let last_offset = last.node_offset;

    if (first_node == last_node)
        return { first: first_node, first_offset: first_offset, last: last_node, last_offset: last_offset };

    if ((first_offset == first_node.textContent.length) && (first_node.nextElementSibling != null)) {
        first_node = first_node.nextElementSibling as HTMLSpanElement;
        first_offset = 0;
    }
    if (first_node == last_node)
        return { first: first_node, first_offset: first_offset, last: last_node, last_offset: last_offset };

    if ((last_offset == 0) && (last_node.previousElementSibling != null)) {
        last_node = last_node.previousElementSibling as HTMLSpanElement;
        last_offset = last_node.textContent.length;
    }
    return { first: first_node, first_offset: first_offset, last: last_node, last_offset: last_offset };
}

/**
 * Function to restore backed up range and set to current line-content.
 * @param range - range to put restored boundaries to (`Selection.getRangeAt(0)`).
 */
function restore_range (range: Range) {
    range._setRangeStartInNode(get_chosen_line_content(), range_backup.start);
    range._setRangeEndInNode(get_chosen_line_content(), range_backup.end);
}

/**
 * Function that determines if range starts and ends in single styled span.
 * @see terminal styled span
 * @param range - given range.
 */
export function get_collapse (range: Range): HTMLSpanElement | null {
    const { first, last } = parse_range(range, false);
    if (first == last) return first;
    else return null;
}



// Node splitting & joining section.

/**
 * Function that splits styled span at given position.
 * @see terminal styled span
 * @param elem element to split.
 * @param pos position to split at.
 * @param postInsert if true inserts new node after `elem`, else otherwise.
 */
function split_at (elem: HTMLSpanElement, pos: number, postInsert: boolean) {
    elem.classList.remove(...Object.keys(VAR_NAMES));
    const clone = elem.cloneNode(true) as HTMLSpanElement;
    if (!postInsert) {
        clone.textContent = elem.textContent.slice(0, pos);
        elem.before(clone);
        elem.textContent = elem.textContent.slice(pos);
    } else {
        clone.textContent = elem.textContent.slice(pos);
        elem.after(clone);
        elem.textContent = elem.textContent.slice(0, pos);
    }
}

/**
 * Presuming that selected - is an array of styled spans, to that new formatting was just applied,
 * this function merges elements having same formatting.
 * It also takes in account one element before selected, and one after.
 * @see terminal styled spans
 * @param selected array of elements.
 */
function join_around (selected: HTMLSpanElement[]) {
    if (selected.length == 0) return;

    const around = [...selected];
    around.unshift(around[0].previousElementSibling as HTMLSpanElement);
    around.push(around[around.length - 1].nextElementSibling as HTMLSpanElement);

    around.forEach((value: HTMLSpanElement, index: number): void => {
        const friend = around[index - 1];
        if (!friend || !value) return;
        if (areArraysEqual([...value.classList], [...friend.classList])) {
            value.textContent = friend.textContent + value.textContent;
            friend.remove();
            value.classList.remove(...Object.keys(VAR_NAMES));
        }
    });
}



// Node interpolating section.

/**
 * Function that makes array of styled spans between first and last.
 * @see terminal styled spans
 * @param first first node in array.
 * @param last last node in array.
 * @return array of node nodes between first and last.
 */
function get_nodes_between (first: HTMLSpanElement, last: HTMLSpanElement): HTMLSpanElement[] {
    if (first == last) return [first];
    const selected: HTMLSpanElement[] = [];
    let current = first;
    while (current != last) {
        selected.push(current);
        current = current.nextElementSibling as HTMLSpanElement;
    }
    selected.push(last);
    return selected;
}

/**
 * Function to get selected styled spans.
 * @see terminal styled spans
 * @see get_nodes_between get nodes between
 * @param range range of the nodes to get.
 * @return array of nodes in range.
 */
export function get_selected_nodes (range: Range): HTMLSpanElement[] {
    const { first, last } = parse_range(range, false);
    return get_nodes_between(first, last);
}



// Node styling section.

/**
 * Interface representing a single formatting action.
 * + `type` - formatting class name.
 * + `value` - formatting value.
 */
interface Formatting {
    type: string;
    value: string | boolean;
}

/**
 * Main function of cutter.
 * It applies given style to a node (preset example) or to a range of nodes (styled spans),
 * cutting and merging them if necessary.
 * @see terminal styled spans
 * @see restorePresets preset example
 * @param range node or range to apply style to.
 * @param format style that will be applied.
 */
export function style (range: Range | HTMLDivElement, format?: Formatting) {
    if (range instanceof HTMLDivElement) apply_formatting(range, format);
    else cut(range, format);
}

/**
 * Function that performs range formatting. It cuts nodes, merges styled spans and applies style to them.
 * @see terminal styled spans
 * @param range range of nodes to style.
 * @param format style to apply.
 */
function cut (range: Range, format?: Formatting) {
    if (range.collapsed) return;

    const cuttingStart = (offset: number, start: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == start.textContent.length);
    };
    const cuttingEnd = (offset: number, end: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == end.textContent.length);
    };

    const { first, last, first_offset, last_offset } = parse_range(range, true);

    if (first.isSameNode(last)) {
        const finalOffset = last_offset - first_offset;
        if (!cuttingStart(first_offset, first)) split_at(first, first_offset, false);
        if (!cuttingEnd(finalOffset, last)) split_at(last, finalOffset, true);
    } else {
        if (!cuttingStart(first_offset, first)) split_at(first, first_offset, false);
        if (!cuttingEnd(last_offset, last)) split_at(last, last_offset, true);
    }

    const selected = get_nodes_between(first, last);
    for (const child of selected) apply_formatting(child, format);

    join_around(selected);
    restore_range(range);
}

/**
 * Function that applies formatting to given node.
 * @param elem element to style.
 * @param format style to apply.
 */
function apply_formatting (elem: HTMLElement, format?: Formatting) {
    if (format == null) elem.className = "";
    else {
        if (multiplePrefix(format.type)) {
            const new_name = format.type + SEPARATOR + format.value;
            const same_class = [...elem.classList].find((value: string): boolean => {
                return value.startsWith(format.type);
            });
            if (!!same_class) elem.classList.replace(same_class, new_name);
            else elem.classList.add(new_name);
        }
        else elem.classList.toggle(format.type, format.value as boolean);
    }
}



// Class utils section.

/**
 * Function that identifies common classes of all nodes in given range of styled spans or a single node.
 * @see terminal styled spans
 * @param range - range of nodes with common classes.
 * @param single - node to identify classes.
 * @return list of common classes or null if none.
 */
export function get_common_classes(range?: Range, single?: HTMLDivElement): string[] | null {
    if (!range == !single) return null;
    let base: HTMLElement[];
    if (!!single) base = [single];
    else base = get_selected_nodes(range);
    const multiple = base.map((value: HTMLElement): string[] => {
        const classes = [...value.classList];
        for (const def in DEFAULTS) {
            const target = classes.find((val) => { return getPrefix(val) == def; });
            if (!target) classes.push(def + SEPARATOR + DEFAULTS[def]);
        }
        return classes;
    });
    if (multiple.length == 0) return null;
    return multiple.reduce((prev: string[], value: string[]): string[] => {
        return getSameElements(prev, value);
    }, multiple[0]);
}
