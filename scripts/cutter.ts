import { multiplePrefix, SEPARATOR } from "../consts/constants";
import { areArraysEqual } from "./utils";

function splitAt(all: SelectionAll, splitStart: boolean, pos: number, postInsert: boolean = false) {
    const element = splitStart ? all.firstElem : all.lastElem;
    const clone = element.cloneNode(true) as HTMLElement;
    if (!postInsert) {
        clone.innerText = element.innerText.slice(0, pos);
        all.parent.insertBefore(clone, element);
        element.innerText = element.innerText.slice(pos);
    } else {
        clone.innerText = element.innerText.slice(pos);
        all.parent.insertBefore(clone, element.nextSibling);
        element.innerText = element.innerText.slice(0, pos);
        all.range.setEnd(clone, 0);
        all.lastElem = clone;
    }
}



function getTargetSpan(node: Node): HTMLElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName == 'DIV') return (node as Element).lastElementChild as HTMLElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLElement;
}



function getSelected (all: SelectionAll, selectPoint = false): Array<HTMLElement> {
    const selected = [...all.parent.children] as Array<HTMLElement>;
    for (let i = 0; i < selected.length; i++) {
        let exclude = false;
        exclude = exclude || !all.range.intersectsNode(selected[i]);
        exclude = exclude || ((selected[i].isEqualNode(all.firstElem))
            && (all.range.startOffset == all.firstElem.innerText.length));
        exclude = exclude || ((selected[i].isEqualNode(all.lastElem))
            && (all.range.endOffset == 0));
        if (exclude) {
            selected.splice(i, 1);
            i--;
        }
    }
    if (selectPoint && (all.firstElem == all.lastElem) && (all.range.startOffset == all.range.endOffset))
        selected.push(all.firstElem);
    return selected;
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
        return (offset == 0) || (offset == start.innerText.length);
    };
    const cuttingEnd = (offset: number, end: HTMLElement): boolean => {
        return (offset == 0) || (offset == end.innerText.length)
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

    for (const child of getSelected(all))
        if (multiplePrefix(format.type)) changeClass(child, format.type, format.value as string);
        else child.classList.toggle(format.type, format.value as boolean);
}



export function getCommonClasses(single?: Element): Array<string> | null {
    if (single) return [...single.classList];
    else {
        const multiple = getSelected(parseSelection(), true);
        if (multiple.length == 0) return null;
        const classes = [...multiple[0].classList];
        if (multiple.every((value: HTMLElement): boolean => {
            return areArraysEqual(classes, [...value.classList]);
        })) return classes;
        else return null;
    }
}
