import { multiplePrefix, PREFIXES, SEPARATOR } from "../constants";

function splitAt(element: HTMLElement, parent: HTMLElement, pos: number, postInsertRange?: Range) {
    const clone = element.cloneNode(true) as HTMLElement;
    if (!postInsertRange) {
        clone.innerText = element.innerText.slice(0, pos);
        parent.insertBefore(clone, element);
        element.innerText = element.innerText.slice(pos);
    } else {
        clone.innerText = element.innerText.slice(pos);
        parent.insertBefore(clone, element.nextSibling);
        element.innerText = element.innerText.slice(0, pos);
        postInsertRange.setEnd(clone, 0);
    }
}

function isCuttingStart(offset: number, start: HTMLElement) {
    return (offset == 0) || (offset == start.innerText.length);
}

function isCuttingEnd(offset: number, end: HTMLElement) {
    return (offset == 0) || (offset == end.innerText.length);
}

function isThisStart(node: Element, start: HTMLElement, offset: number) {
    return (node.isEqualNode(start)) && (offset != start.innerText.length);
}

function isThisEnd(node: Element, start: HTMLElement, offset: number) {
    return (node.isEqualNode(start)) && (offset != 0);
}



function getTargetSpan(node: Node): HTMLElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLElement;
}



interface Formatting {
    type: string;
    value: string | boolean;
}

function changeClass(elem: Element, name: string, val: string): void {
    const new_name = name + SEPARATOR + val;
    for (const cls of elem.classList) if (cls.startsWith(name)) {
        elem.classList.replace(cls, new_name);
        return;
    }
    elem.classList.add(new_name);
}

export function change(format: Formatting): void {
    const sel = document.getSelection();
    const range = sel.getRangeAt(0);
    const firstElem = getTargetSpan(range.startContainer);
    const lastElem = getTargetSpan(range.endContainer);
    let parent: HTMLElement;

    if (firstElem.isSameNode(lastElem)) {
        parent = firstElem.parentElement;
        const finalOffset = range.endOffset - range.startOffset;
        if (!isCuttingStart(range.startOffset, firstElem)) splitAt(firstElem, parent, range.startOffset);
        if (!isCuttingEnd(finalOffset, lastElem)) splitAt(lastElem, parent, finalOffset, range);
    } else {
        parent = range.commonAncestorContainer as HTMLElement;
        if (!isCuttingStart(range.startOffset, firstElem)) splitAt(firstElem, parent, range.startOffset);
        if (!isCuttingEnd(range.endOffset, lastElem)) splitAt(lastElem, parent, range.endOffset);
    }

    for (const child of parent.children) if (sel.containsNode(child) ||
            isThisStart(child, firstElem, range.startOffset) ||
            isThisEnd(child, lastElem, range.endOffset)) {

        for (const prefix in PREFIXES) if (format.type == prefix) {
            if (multiplePrefix(prefix)) changeClass(child, prefix, format.value as string);
            else child.classList.toggle(prefix, format.value as boolean);
        }
    }
}
