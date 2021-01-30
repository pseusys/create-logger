// ARRAY utils:

export function areArraysEqual<T> (a: T[], b: T[]): boolean {
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

export function getSameElements<T> (a: T[], b: T[]): T[] {
    if (areArraysEqual(a, b)) return a;
    return [...a].filter((value: T): boolean => { return b.includes(value); });
}



// RANGE utils:

function children (node: Element, nodes: Node[] = []): Node[] {
    node.childNodes.forEach((value: Node): void => {
        nodes.push(value);
        if (value.hasChildNodes()) children(value as Element, nodes);
    });
    return nodes;
}

export function setRangeInNode (range: Range, node: HTMLElement, pos?: number) {
    const position = pos !== undefined ? Math.min(pos, node.textContent.length) : node.textContent.length;
    setRangeStartInNode(range, node, position);
    range.collapse(true);
}

function setRangeAnythingInNode (range: Range, node: HTMLElement, pos: number, start: boolean) {
    if (node.nodeType == Node.TEXT_NODE) {
        if (start) range.setStart(node, pos);
        else range.setEnd(node, pos);
    } else if (!children(node).some((value: Node): boolean => {
        if (value.nodeType == Node.TEXT_NODE) {
            if (value.textContent.length >= pos) {
                if (start) range.setStart(value, pos);
                else range.setEnd(value, pos);
                return true;
            } else {
                pos -= value.textContent.length;
                return false;
            }
        } else return false;
    })) {
        if (start) range.setStart(node, pos);
        else range.setEnd(node, pos);
    }
}

export function setRangeStartInNode (range: Range, node: HTMLElement, pos: number) {
    setRangeAnythingInNode(range, node, pos, true);
}

export function setRangeEndInNode (range: Range, node: HTMLElement, pos: number) {
    setRangeAnythingInNode(range, node, pos, false);
}

type NodeInfo = { offset: number, node: Node, node_offset: number };

function nodesInChars (before: Node | null, parent: Node): NodeInfo {
    const desc = children(parent as Element);
    const max_index = before === null ? desc.length : desc.findIndex((value: Node): boolean => {
        return value == before;
    });

    let node: Node;
    let node_offset = 0;
    if (!!before) {
        node = before;
    } else if (desc.length > 0) {
        node = desc[desc.length - 1];
        node_offset = node.textContent.length;
    } else {
        node = parent;
    }

    return  {
        offset: desc.reduce((previous: number, value: Node, index: number): number => {
                if ((index < max_index) && (value.nodeType == Node.TEXT_NODE))
                    return previous + value.textContent.length;
                else return previous;
            }, 0),
        node: node,
        node_offset: node_offset
    };
}

function getRangeAnythingInNode (anchor: Node, off: number, node: Node): NodeInfo | null {
    if (node.contains(anchor)) {
        if (node == anchor) {
            if (node.nodeType == Node.TEXT_NODE) return { offset: off, node: node, node_offset: off };
            else return nodesInChars(off == node.childNodes.length ? null : node.childNodes[off], node);
        } else {
            const info = getRangeAnythingInNode(anchor, off, anchor);
            const { offset } = nodesInChars(anchor, node);
            return { offset: offset + info.offset, node: info.node, node_offset: info.node_offset };
        }
    } else return null;
}

export function getRangeStartInNode (range: Range, parent: Node): { start: number, first: Node, f_off: number } | null {
    const { offset, node, node_offset } = getRangeAnythingInNode(range.startContainer, range.startOffset, parent);
    return { start: offset, first: node, f_off: node_offset };
}

export function getRangeEndInNode (range: Range, parent: Node): { end: number, last: Node, l_off: number } | null {
    const { offset, node, node_offset } = getRangeAnythingInNode(range.endContainer, range.endOffset, parent);
    return { end: offset, last: node, l_off: node_offset };
}

export function getFocusOffsetInNode (selection: Selection, parent: Node): number | null {
    const range = selection.getRangeAt(0);
    if ((selection.focusNode == range.startContainer) && (selection.focusOffset == range.startOffset))
        return getRangeStartInNode(range, parent).start;
    else return getRangeEndInNode(range, parent).end;
}
