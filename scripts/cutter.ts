import { DEFAULTS, getPrefix, multiplePrefix, SEPARATOR } from "../consts/constants";
import { areArraysEqual, getSameElements } from "./utils";
import {find_span_for_place, get_child_for_span, get_parent_for_span} from "./terminal";

type Selection = { range: Range, first: HTMLSpanElement, last: HTMLSpanElement };

//TODO: for both elements make null "var_name" and "var_type"
function splitAt(elem: HTMLSpanElement, pos: number, postInsert: boolean = false): HTMLSpanElement {
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
    return clone;
}

//TODO: for both elements make null "var_name" and "var_type"
function joinAround(range: Range, selected: HTMLSpanElement[]): void {
    if (selected.length == 0) return;

    const around = [...selected];
    around.unshift(around[0].previousElementSibling as HTMLSpanElement);
    around.push(around[around.length - 1].nextElementSibling as HTMLSpanElement);

    around.forEach((value: HTMLSpanElement, index: number): void => {
        const friend = around[index-1];
        if (!friend || !value) return;
        if (areArraysEqual([...value.classList], [...friend.classList])) {
            const start_offset = range.startOffset;
            const end_offset = range.endOffset + friend.textContent.length;

            value.textContent = friend.textContent + value.textContent;
            if (friend.contains(range.startContainer) || value.contains(range.startContainer))
                range.setStart(get_child_for_span(value), start_offset);
            if (friend.contains(range.endContainer) || value.contains(range.endContainer))
                range.setEnd(get_child_for_span(value), end_offset);
            friend.remove();
        }
    });
}



function getSelected ({ range, first, last }: Selection, selectPoint = false): HTMLSpanElement[] {
    const parent = get_parent_for_span(first);
    const selected = [...parent.children].filter((value: HTMLSpanElement): boolean => {
        let passes = true;
        passes &&= range.intersectsNode(value);
        passes &&= !((value.isEqualNode(first)) && (range.startOffset == first.textContent.length));
        passes &&= !((value.isEqualNode(last)) && (range.endOffset == 0));
        return passes;
    });
    if (selectPoint && (selected.length == 0))
        if ((first == last) && (range.startOffset == range.endOffset))
            selected.push(first);
    return selected as HTMLSpanElement[];
}

function parseSelection (): Selection {
    const range = document.getSelection().getRangeAt(0);
    const first = find_span_for_place(range.startContainer);
    const last = find_span_for_place(range.endContainer);
    return { range, first, last };
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

export function change(format: Formatting): void {
    const cuttingStart = (offset: number, start: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == start.textContent.length);
    };
    const cuttingEnd = (offset: number, end: HTMLSpanElement): boolean => {
        return (offset == 0) || (offset == end.textContent.length)
    };
    let { range, first, last } = parseSelection();

    if (first.isSameNode(last)) {
        const finalOffset = range.endOffset - range.startOffset;
        if (!cuttingStart(range.startOffset, first)) splitAt(first, range.startOffset);
        if (!cuttingEnd(finalOffset, last)) {
            const clone = splitAt(last, finalOffset, true);
            range.setEnd(clone, 0);
            last = clone;
        }
    } else {
        if (!cuttingStart(range.startOffset, first)) splitAt(first, range.startOffset);
        if (!cuttingEnd(range.endOffset, last)) splitAt(last, range.endOffset);
    }

    const selected = getSelected({ range, first, last });
    for (const child of selected)
        if (multiplePrefix(format.type)) changeClass(child, format.type, format.value as string);
        else child.classList.toggle(format.type, format.value as boolean);

    joinAround(range, selected);
}



export function getCommonClasses(single?: Element): string[] | null {
    if (single) return [...single.classList];
    else {
        const multiple = getSelected(parseSelection(), true).map((value): string[] => {
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
