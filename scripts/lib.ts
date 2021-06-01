// We have to declare Range and Selection for this code not to break Node.js environment.
// We can extend basic types as far as no untrusted third-party libraries are included.

declare interface Range {
    _set_range_in_node (node: HTMLElement, pos?: number);
    _set_range_start_in_node (node: HTMLElement, pos: number);
    _set_range_end_in_node (node: HTMLElement, pos: number);
    _get_range_start_in_node (node: Node): NodeInfo | null;
    _get_range_end_in_node (node: Node): NodeInfo | null;
}

declare interface Selection {
    _get_focus_offset_in_node (node: Node): number | null;
}

declare interface HTMLInputElement {
    _check (value: boolean);
    _set (value: string);
    _enable (enabled: boolean);
}

declare interface HTMLSelectElement {
    _enable (enabled: boolean);
}



// Declarations & utils section.

/**
 * A type, representing one of the Range sides. It contains node and its offset.
 * + `offset` - offset from the beginning of parent line-content to the beginning of range.
 * + `node` - node (text node) in the beginning of the range.
 * + `node_offset` - offset from beginning of the `node` to beginning of the range.
 */
type NodeInfo = { offset: number, node: Node, node_offset: number };

/**
 * Function, returning all descendants of given node, elder come first.<\br>
 * E.G. <foo><bar><baz><\baz><\bar><tan><\tan><\foo> -> [foo, bar, baz, tan]
 * @param node parent node.
 * @param nodes !ALWAYS! empty array, used for recursion.
 */
function children (node: Element, nodes: Node[] = []): Node[] {
    node.childNodes.forEach((value: Node): void => {
        nodes.push(value);
        if (value.hasChildNodes()) children(value as Element, nodes);
    });
    return nodes;
}



// 'Set range' section.

/**
 * Method, setting collapsed range (aka caret) in current node (line-content).
 * @param node parent line-content, the caret will be set inside of it.
 * @param pos position of caret inside node. By default will be set to the very end.
 */
Range.prototype._set_range_in_node = function (node: HTMLElement, pos?: number) {
    const position = pos != undefined ? Math.min(pos, node.textContent.length) : node.textContent.length;
    this._set_range_start_in_node(node, position);
    this.collapse(true);
}

/**
 * Function to set [start / end] of the range inside node.
 * @param range range to set inside of the node.
 * @param node node to set range in.
 * @param pos position to set
 * @param start sets start of the range to pos if true, end if false
 */
function set_range_anything_in_node (range: Range, node: HTMLElement, pos: number, start: boolean) {
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

/**
 * Function, setting start of the range inside of the given line-content node.
 * @see set_range_anything_in_node set range [start] in node
 * @param node line-content to set range start in.
 * @param pos position to set.
 */
Range.prototype._set_range_start_in_node = function (node: HTMLElement, pos: number) {
    set_range_anything_in_node(this, node, pos, true);
}

/**
 * Function, setting end of the range inside of the given line-content node.
 * @see set_range_anything_in_node set range [end] in node
 * @param node line-content to set range end in.
 * @param pos position to set.
 */
Range.prototype._set_range_end_in_node = function (node: HTMLElement, pos: number) {
    set_range_anything_in_node(this, node, pos, false);
}



// 'Get range' section.

/**
 * Function counting offset before a node in parent node _in characters_.
 * If no node provided, parent length will be counted.
 * @param before node to count offset before or null, in that case  parent length will be counted.
 * @param parent node to count offset in.
 * @return NodeInfo info about position of before in parent.
 */
function nodes_in_chars (before: Node | null, parent: Node): NodeInfo {
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

/**
 * Function to get beginning or end of the range inside node.
 * @param anchor `[start / end]Container` of the range, must be a child of node.
 * @param off `[start / end]Offset` of the range.
 * @param node parent node, line-content, containing whole range.
 * @return information about position of range [start / end] in node, or null if nod is not parent of anchor.
 */
function get_range_anything_in_node (anchor: Node, off: number, node: Node): NodeInfo | null {
    if (node.contains(anchor)) {
        if (node == anchor) {
            if (node.nodeType == Node.TEXT_NODE) return {offset: off, node: node, node_offset: off};
            else return nodes_in_chars(off == node.childNodes.length ? null : node.childNodes[off], node);
        } else {
            const info = get_range_anything_in_node(anchor, off, anchor);
            const {offset} = nodes_in_chars(anchor, node);
            return {offset: offset + info.offset, node: info.node, node_offset: info.node_offset};
        }
    } else return null;
}

/**
 * Function, getting start of the range inside of the given line-content node.
 * @see get_range_anything_in_node get range [start] in node
 * @param node line-content to get range start in.
 * @return NodeInfo info about range start or null if range is not inside of node.
 */
Range.prototype._get_range_start_in_node = function (node: Node): NodeInfo | null {
    return get_range_anything_in_node(this.startContainer, this.startOffset, node);
}

/**
 * Function, getting end of the range inside of the given line-content node.
 * @see get_range_anything_in_node get range [end] in node
 * @param node line-content to get range end in.
 * @return NodeInfo info about range end or null if range is not inside of node.
 */
Range.prototype._get_range_end_in_node = function (node: Node): NodeInfo | null {
    return get_range_anything_in_node(this.endContainer, this.endOffset, node);
}



// Selection section.

/**
 * Function to get position of caret inside the selection (start or end, obviously).
 * @param node node, containing selection.
 * @return position of caret or null, if node does not contain selection.
 */
Selection.prototype._get_focus_offset_in_node = function (node: Node): number | null {
    const range = this.getRangeAt(0);
    if ((this.focusNode == range.startContainer) && (this.focusOffset == range.startOffset))
        return range._get_range_start_in_node(node).offset;
    else return range._get_range_end_in_node(node).offset;
}



// MDL-nodes mastering section.

/**
 * Function, setting check to MDL switch, radio or checkbox.
 * @param value boolean value to set.
 */
HTMLInputElement.prototype._check = function (value: boolean) {
    if (!!this.parentElement['MaterialSwitch']) {
        const check = this.parentElement['MaterialSwitch'];
        if (value) check.on();
        else check.off();
    } else {
        const check = this.parentElement['MaterialRadio'] ?? this.parentElement['MaterialCheckbox'];
        if (value) check.check();
        else check.uncheck();
    }
}

/**
 * Function, setting string to MDL text input.
 * @param value string value to set.
 */
HTMLInputElement.prototype._set = function (value: string) {
    this.parentElement['MaterialTextfield'].change(value);
}

/**
 * Function to enable/disable MDL text input and select.
 * @param enabled enable or disable node.
 */
function enable (enabled: boolean) {
    const field = this.parentElement['MaterialTextfield'];
    if (enabled) field.enable();
    else field.disable();
}

HTMLInputElement.prototype._enable = enable;
HTMLSelectElement.prototype._enable = enable;
