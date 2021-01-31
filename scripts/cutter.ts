import { DEFAULTS, getPrefix, multiplePrefix, SEPARATOR } from "../consts/constants";
import { areArraysEqual, getSameElements } from "./utils";
import { find_span_for_place, get_chosen_line_content } from "./terminal";

type NodeWithOffset = { node: HTMLSpanElement, offset: number };
type Edges = { first: HTMLSpanElement, last: HTMLSpanElement, first_offset: number, last_offset: number };

let range_backup: { start: number, end: number };

function normalize (node: Node, offset: number, start: boolean): NodeWithOffset {
    const span = find_span_for_place(node);
    if (start && (offset == node.textContent.length) && (span.nextElementSibling != null))
        return { node: span.nextElementSibling as HTMLSpanElement, offset: 0 };
    if (!start && (offset == 0) && (span.previousElementSibling != null))
        return { node: span.previousElementSibling as HTMLSpanElement, offset: node.textContent.length };
    return { node: span, offset: offset };
}

function parse_range (range: Range, backup: boolean): Edges {
    const parent = get_chosen_line_content();
    let start = range._getRangeStartInNode(parent);
    let end = range._getRangeEndInNode(parent);
    if (backup) range_backup = { start: start.offset, end: end.offset };

    if (start == end) return {
        first: find_span_for_place(start.node),
        last: find_span_for_place(end.node),
        first_offset: start.node_offset,
        last_offset: end.node_offset
    }; else  {
        const first = normalize(start.node, start.node_offset, true);
        const last = normalize(end.node, end.node_offset, false);
        return { first: first.node, last: last.node, first_offset: first.offset, last_offset: last.offset };
    }
}

function restore_range (range: Range): void {
    range._setRangeStartInNode(get_chosen_line_content(), range_backup.start);
    range._setRangeEndInNode(get_chosen_line_content(), range_backup.end);
}



//TODO: for both elements make null "var_name" and "var_type"
function splitAt(elem: HTMLSpanElement, pos: number, postInsert: boolean = false) {
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

//TODO: for both elements make null "var_name" and "var_type"
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

function changeClass(elem: Element, name: string, val: string): void {
    const new_name = name + SEPARATOR + val;
    const same_class = [...elem.classList].find((value: string): boolean => {
        return value.startsWith(name);
    });
    if (!!same_class) elem.classList.replace(same_class, new_name);
    else elem.classList.add(new_name);
}

export function change(selection: Selection, format: Formatting): void {
    if (selection.isCollapsed) return;

    const cuttingStart = (offset: number, start: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == start.textContent.length);
    };
    const cuttingEnd = (offset: number, end: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == end.textContent.length)
    };

    const range = selection.getRangeAt(0);
    const { first, last, first_offset, last_offset } = parse_range(range, true);

    if (first.isSameNode(last)) {
        const finalOffset = last_offset - first_offset;
        if (!cuttingStart(first_offset, first)) splitAt(first, first_offset);
        if (!cuttingEnd(finalOffset, last)) splitAt(last, finalOffset, true);
    } else {
        if (!cuttingStart(first_offset, first)) splitAt(first, first_offset);
        if (!cuttingEnd(last_offset, last)) splitAt(last, last_offset);
    }

    const selected = getSelected(first, last);
    for (const child of selected)
        if (multiplePrefix(format.type)) changeClass(child, format.type, format.value as string);
        else child.classList.toggle(format.type, format.value as boolean);

    joinAround(selected);
    restore_range(range);
}



export function getCommonClasses(selection: Selection, single?: Element): string[] | null {
    if (single) return [...single.classList];
    else {
        const { first, last } = parse_range(selection.getRangeAt(0), false);
        const multiple = getSelected(first, last).map((value): string[] => {
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
}
