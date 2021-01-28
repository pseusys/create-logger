import {DEFAULTS, getPrefix, multiplePrefix, SEPARATOR} from "../consts/constants";
import { areArraysEqual, getSameElements } from "./utils";

//TODO: for both elements make null "var_name" and "var_type"
function splitAt(all: SelectionAll, splitStart: boolean, pos: number, postInsert: boolean = false) {
    const element = splitStart ? all.firstElem : all.lastElem;
    const clone = element.cloneNode(true) as HTMLElement;
    if (!postInsert) {
        clone.textContent = element.textContent.slice(0, pos);
        all.parent.insertBefore(clone, element);
        element.textContent = element.textContent.slice(pos);
    } else {
        clone.textContent = element.textContent.slice(pos);
        all.parent.insertBefore(clone, element.nextSibling);
        element.textContent = element.textContent.slice(0, pos);
        all.range.setEnd(clone, 0);
        all.lastElem = clone;
    }
}

//TODO: for both elements make null "var_name" and "var_type"
function joinAround(range: Range, selected: HTMLElement[]): void {
    if (selected.length == 0) return;

    const around = [...selected];
    around.unshift(around[0].previousElementSibling as HTMLElement);
    around.push(around[around.length - 1].nextElementSibling as HTMLElement);

    around.forEach((value: HTMLElement, index: number): void => {
        const friend = around[index-1];
        if (!friend || !value) return;
        if (areArraysEqual([...value.classList], [...friend.classList])) {
            const start_offset = range.startOffset;
            const end_offset = range.endOffset + friend.textContent.length;

            value.textContent = friend.textContent + value.textContent;
            // Assuming that text node is span's first child.
            if ((friend.childNodes.length != 1) || (value.childNodes.length != 1))
                throw new DOMException("Suspicious span children count");

            if (friend.contains(range.startContainer) || value.contains(range.startContainer))
                range.setStart(value.firstChild, start_offset);
            if (friend.contains(range.endContainer) || value.contains(range.endContainer))
                range.setEnd(value.firstChild, end_offset);
            friend.remove();
        }
    });
}



function getTargetSpan(node: Node): HTMLElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName == 'DIV') return (node as Element).lastElementChild as HTMLElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLElement;
}



function getSelected (all: SelectionAll, selectPoint = false): HTMLElement[] {
    const selected = [...all.parent.children].filter((value: HTMLElement): boolean => {
        let passes = true;
        passes &&= all.range.intersectsNode(value);
        passes &&= !((value.isEqualNode(all.firstElem)) && (all.range.startOffset == all.firstElem.textContent.length));
        passes &&= !((value.isEqualNode(all.lastElem)) && (all.range.endOffset == 0));
        return passes;
    });
    if (selectPoint && (selected.length == 0))
        if ((all.firstElem == all.lastElem) && (all.range.startOffset == all.range.endOffset))
            selected.push(all.firstElem);
    return selected as HTMLElement[];
}

interface SelectionAll {
    range: Range;
    firstElem: HTMLElement;
    lastElem: HTMLElement;
    parent: HTMLElement;
}

function parseSelection (): SelectionAll {
    let all = {} as SelectionAll;
    all.range = document.getSelection().getRangeAt(0);
    all.firstElem = getTargetSpan(all.range.startContainer);
    all.lastElem = getTargetSpan(all.range.endContainer);
    if (all.firstElem.isSameNode(all.lastElem)) all.parent = all.firstElem.parentElement;
    else all.parent = all.range.commonAncestorContainer as HTMLElement;
    return all;
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
    const cuttingStart = (offset: number, start: HTMLElement): boolean => {
        return (offset == 0) || (offset == start.textContent.length);
    };
    const cuttingEnd = (offset: number, end: HTMLElement): boolean => {
        return (offset == 0) || (offset == end.textContent.length)
    };
    const all = parseSelection();

    if (all.firstElem.isSameNode(all.lastElem)) {
        const finalOffset = all.range.endOffset - all.range.startOffset;
        if (!cuttingStart(all.range.startOffset, all.firstElem)) splitAt(all, true, all.range.startOffset);
        if (!cuttingEnd(finalOffset, all.lastElem)) splitAt(all, false, finalOffset, true);
    } else {
        if (!cuttingStart(all.range.startOffset, all.firstElem)) splitAt(all, true, all.range.startOffset);
        if (!cuttingEnd(all.range.endOffset, all.lastElem)) splitAt(all, false, all.range.endOffset);
    }

    const selected = getSelected(all);
    for (const child of selected)
        if (multiplePrefix(format.type)) changeClass(child, format.type, format.value as string);
        else child.classList.toggle(format.type, format.value as boolean);

    joinAround(all.range, selected);
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

//TODO: revise, knowing that text node is the first spans node
