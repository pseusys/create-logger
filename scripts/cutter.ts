import {DEFAULTS, getPrefix, multiplePrefix, SEPARATOR, VAR_NAMES} from "../core/constants";
import { areArraysEqual, getSameElements } from "../core/utils";
import { find_span_for_place, get_chosen_line_content } from "./terminal";


type NodeEdges = { first: Node, last: Node, first_offset: number, last_offset: number };
type SpanEdges = { first: HTMLSpanElement, last: HTMLSpanElement, first_offset: number, last_offset: number };

let range_backup: { start: number, end: number };

function normalize (edges: NodeEdges): SpanEdges {
    let start = { node: find_span_for_place(edges.first), offset: edges.first_offset };
    let end = { node: find_span_for_place(edges.last), offset: edges.last_offset };

    if (start.node == end.node)
        return { first: start.node, first_offset: start.offset, last: end.node, last_offset: end.offset };

    if ((start.offset == start.node.textContent.length) && (start.node.nextElementSibling != null))
        start = { node: start.node.nextElementSibling as HTMLSpanElement, offset: 0};

    if (start.node == end.node)
        return { first: start.node, first_offset: start.offset, last: end.node, last_offset: end.offset };

    if ((end.offset == 0) && (end.node.previousElementSibling != null))
        end = {
            node: end.node.previousElementSibling as HTMLSpanElement,
            offset: end.node.previousElementSibling.textContent.length
        };

    return { first: start.node, first_offset: start.offset, last: end.node, last_offset: end.offset };
}

function parse_range (range: Range, backup: boolean): SpanEdges {
    const parent = get_chosen_line_content();
    let start = range._getRangeStartInNode(parent);
    let end = range._getRangeEndInNode(parent);
    if (backup) range_backup = { start: start.offset, end: end.offset };

    if (start == end) return {
        first: find_span_for_place(start.node),
        last: find_span_for_place(end.node),
        first_offset: start.node_offset,
        last_offset: end.node_offset
    }; else return normalize({
        first: start.node,
        first_offset: start.node_offset,
        last: end.node,
        last_offset: end.node_offset
    });
}

function restore_range (range: Range): void {
    range._setRangeStartInNode(get_chosen_line_content(), range_backup.start);
    range._setRangeEndInNode(get_chosen_line_content(), range_backup.end);
}



function splitAt(elem: HTMLSpanElement, pos: number, postInsert: boolean) {
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

function joinAround(selected: HTMLSpanElement[]): void {
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



function getSelected (first: HTMLSpanElement, last: HTMLSpanElement): HTMLSpanElement[] {
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

interface Formatting {
    type: string;
    value: string | boolean;
}

export function get_selected (range: Range): HTMLSpanElement[] {
    const { first, last } = parse_range(range, false);
    return getSelected(first, last);
}

export function style (range: Range | HTMLDivElement, format?: Formatting): void {
    if (range instanceof HTMLDivElement) applyFormatting(range, format);
    else cut(range, format);
}

function cut (range: Range, format?: Formatting): void {
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
        if (!cuttingStart(first_offset, first)) splitAt(first, first_offset, false);
        if (!cuttingEnd(finalOffset, last)) splitAt(last, finalOffset, true);
    } else {
        if (!cuttingStart(first_offset, first)) splitAt(first, first_offset, false);
        if (!cuttingEnd(last_offset, last)) splitAt(last, last_offset, true);
    }

    const selected = getSelected(first, last);
    for (const child of selected) applyFormatting(child, format);

    joinAround(selected);
    restore_range(range);
}

function applyFormatting (elem: HTMLElement, format?: Formatting) {
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



export function getCommonClasses(range?: Range, single?: HTMLDivElement): string[] | null {
    if (!range == !single) return null;
    let base: HTMLElement[];
    if (!!single) base = [single];
    else base = get_selected(range);
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

export function getCollapse (range: Range): HTMLSpanElement | null {
    const { first, last } = parse_range(range, false);
    if (first == last) return first;
    else return null;
}
