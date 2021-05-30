import { CLASS_CODES, DEFAULTS, getPrefix, multiplePrefix, SEPARATOR } from "../core/constants";
import { areArraysEqual, getSameElements } from "../core/utils";
import { ranger } from "./ranger";
import {var_section_attribution} from "./style_tab";



// Node splitting & joining section.

/**
 * Function that splits styled span at given position.
 * @see terminal styled span
 * @param elem element to split.
 * @param pos position to split at.
 * @param postInsert if true inserts new node after `elem`, else otherwise.
 */
function split_at (elem: HTMLSpanElement, pos: number, postInsert: boolean) {
    elem.classList.remove(...Object.values(var_section_attribution));
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
        if (areArraysEqual(get_common_classes(value), get_common_classes(friend))) {
            value.textContent = friend.textContent + value.textContent;
            friend.remove();
            value.classList.remove(...Object.values(var_section_attribution));
        }
    });
}



// Node styling section.

/**
 * Interface representing a single formatting action.
 * + `type` - formatting class name.
 * + `value` - formatting value.
 */
export interface Formatting {
    type: string;
    value: string | boolean;
}

/**
 * Main function of cutter.
 * It applies given style to a node (preset example) or to a selected range of nodes (styled spans),
 * cutting and merging them if necessary.
 * @see ranger selected range
 * @see terminal styled spans
 * @see restore_presets preset example
 * @param acceptor node to apply style to.
 * @param formats styles that will be applied, if null all styles will be dropped.
 */
export function style (formats?: Formatting[], acceptor?: HTMLSpanElement) {
    if (!!acceptor) apply_formatting(acceptor, formats);
    else cut(formats);
}

/**
 * Function that performs range formatting. It cuts nodes, merges styled spans and applies style to them.
 * @see terminal styled spans
 * @param formats style to apply.
 */
function cut (formats: Formatting[]) {
    if (ranger.collapse) return;

    const cutting_start = (offset: number, start: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == start.textContent.length);
    };
    const cutting_end = (offset: number, end: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == end.textContent.length);
    };

    if (ranger.start.isSameNode(ranger.end)) {
        const finalOffset = ranger.e_i_offset - ranger.s_i_offset;
        if (!cutting_start(ranger.s_i_offset, ranger.start)) split_at(ranger.start, ranger.s_i_offset, false);
        if (!cutting_end(finalOffset, ranger.end)) split_at(ranger.end, finalOffset, true);
    } else {
        if (!cutting_start(ranger.s_i_offset, ranger.start)) split_at(ranger.start, ranger.s_i_offset, false);
        if (!cutting_end(ranger.e_i_offset, ranger.end)) split_at(ranger.end, ranger.e_i_offset, true);
    }

    const selected = get_nodes_between(ranger.start, ranger.end);
    for (const child of selected) apply_formatting(child, formats);

    join_around(selected);
    ranger.load(false);
}

/**
 * Function that applies formatting to given node.
 * @param elem element to style.
 * @param formats style to apply.
 */
function apply_formatting (elem: HTMLElement, formats?: Formatting[]) {
    if (formats == null) elem.className = [...elem.classList].filter((value: string): boolean => {
        return !Object.keys(CLASS_CODES).includes(value);
    }).join(" "); else formats.forEach((format: Formatting) => {
        if (multiplePrefix(format.type)) {
            const new_name = format.type + SEPARATOR + format.value;
            const same_class = [...elem.classList].find((value: string): boolean => {
                return value.startsWith(format.type);
            });
            if (!!same_class) elem.classList.replace(same_class, new_name);
            else elem.classList.add(new_name);
        } else elem.classList.toggle(format.type, format.value as boolean);
    });
}



// Nodes interpolation and class utils section.

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
 * Function that identifies common classes of all nodes in selected range of styled spans or a single node.
 * @see ranger selected range
 * @see terminal styled spans
 * @param single - node to identify classes.
 * @return list of common classes or null if none.
 */
export function get_common_classes (single?: HTMLSpanElement): string[] | null {
    let base: HTMLElement[];
    if (!!single) base = [single];
    else base = get_nodes_between(ranger.start, ranger.end);
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
