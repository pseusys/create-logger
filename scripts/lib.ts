// Can use it while no third-party libraries are included
declare interface Range {
    _setRangeInNode(node: HTMLElement, pos?: number): void;
    _setRangeStartInNode(node: HTMLElement, pos: number): void;
    _setRangeEndInNode(node: HTMLElement, pos: number): void;
    _getRangeStartInNode(node: Node): NodeInfo | null;
    _getRangeEndInNode(node: Node): NodeInfo | null;
}

declare interface Selection {
    _getFocusOffsetInNode(node: Node): number | null
}

type NodeInfo = { offset: number, node: Node, node_offset: number };

function children(node: Element, nodes: Node[] = []): Node[] {
    node.childNodes.forEach((value: Node): void => {
        nodes.push(value);
        if (value.hasChildNodes()) children(value as Element, nodes);
    });
    return nodes;
}

Range.prototype._setRangeInNode = function (node: HTMLElement, pos?: number): void {
    const position = pos !== undefined ? Math.min(pos, node.textContent.length) : node.textContent.length;
    console.log(node)
    console.log(position)
    this._setRangeStartInNode(node, position);
    this.collapse(true);
}

function setRangeAnythingInNode(range: Range, node: HTMLElement, pos: number, start: boolean) {
    if ((node.nodeType == Node.TEXT_NODE) || !children(node).some((value: Node): boolean => {
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

Range.prototype._setRangeStartInNode = function (node: HTMLElement, pos: number): void {
    setRangeAnythingInNode(this, node, pos, true);
}

Range.prototype._setRangeEndInNode = function (node: HTMLElement, pos: number): void {
    setRangeAnythingInNode(this, node, pos, false);
}

function nodesInChars(before: Node | null, parent: Node): NodeInfo {
    const desc = children(parent as Element);
    const max_index = before === null ? desc.length : desc.findIndex((value: Node): boolean => {
        return value == before;
    });

    let node: Node;
    let node_offset = 0;
    if (!!before) node = before;
    else if (desc.length > 0) {
        node = desc[desc.length - 1];
        node_offset = node.textContent.length;
    } else node = parent;

    return {
        offset: desc.reduce((previous: number, value: Node, index: number): number => {
                if ((index < max_index) && (value.nodeType == Node.TEXT_NODE))
                    return previous + value.textContent.length;
                else return previous;
            }, 0),
        node: node,
        node_offset: node_offset
    };
}

function getRangeAnythingInNode(anchor: Node, off: number, node: Node): NodeInfo | null {
    if (node.contains(anchor)) {
        if (node == anchor) {
            if (node.nodeType == Node.TEXT_NODE) return {offset: off, node: node, node_offset: off};
            else return nodesInChars(off == node.childNodes.length ? null : node.childNodes[off], node);
        } else {
            const info = getRangeAnythingInNode(anchor, off, anchor);
            const {offset} = nodesInChars(anchor, node);
            return {offset: offset + info.offset, node: info.node, node_offset: info.node_offset};
        }
    } else return null;
}

Range.prototype._getRangeStartInNode = function (node: Node): NodeInfo | null {
    return getRangeAnythingInNode(this.startContainer, this.startOffset, node);
}

Range.prototype._getRangeEndInNode = function (node: Node): NodeInfo | null {
    return getRangeAnythingInNode(this.endContainer, this.endOffset, node);
}

Selection.prototype._getFocusOffsetInNode = function (node: Node): number | null {
    const range = this.getRangeAt(0);
    if ((this.focusNode == range.startContainer) && (this.focusOffset == range.startOffset))
        return range._getRangeStartInNode(node).start;
    else return range._getRangeEndInNode(node).end;
}
