function insert(str: string, substr: string, pos: number): string {
    return str.slice(0, pos) + substr + str.slice(pos);
}



function getHead(element: HTMLElement): string {
    const html = element.outerHTML;
    return html.slice(0, html.indexOf('>') + 1);
}

function getTail(element: HTMLElement): string {
    const html = element.outerHTML;
    return html.slice(html.lastIndexOf('<'));
}

function splitAt(element: HTMLElement, pos: number) {
    const head = getHead(element);
    const tail = getTail(element);
    element.outerHTML = insert(element.outerHTML, tail + head, head.length + pos);
}



function childNum(node: HTMLElement): number {
    let pred = node.previousSibling;
    let sum = 0;
    while (pred != null) {
        sum++;
        pred = pred.previousSibling;
    }
    return sum;
}



function getTargetSpan(node: Node): HTMLElement {
    if (node.nodeType == Node.TEXT_NODE) return node.parentElement;
    if (node.nodeName != 'SPAN') throw new DOMException("Selected wrong element: " + node.nodeName);
    return node as HTMLElement;
}



enum FormattingType {
    FOR_COLOR = 'for',
    BACK_COLOR = 'back',
    THICKNESS = 'sty',
    BLINKING = 'blink',
    CROSSED = 'cross',
    UNDERCROSSED = 'under',
    ITALIC = 'ita'
}

interface Formatting {
    type: FormattingType;
    value: string | boolean;
}

function changeClass(elem: Element, cls: string, val: string): void {
    for (const cls of elem.classList) if (cls.startsWith(cls)) {
        elem.classList.replace(cls, val);
        return;
    }
    elem.classList.add(val);
}

function change(format: Formatting): void {
    const sel = document.getSelection();
    const range = sel.getRangeAt(0);
    let firstElem = getTargetSpan(range.startContainer);
    let lastElem = getTargetSpan(range.endContainer);

    let parent: HTMLElement;
    let startPos = childNum(firstElem);
    let endPos = childNum(lastElem);

    if (firstElem.isSameNode(lastElem)) {
        parent = firstElem.parentElement as HTMLElement;
        const finalOffset = range.endOffset - range.startOffset;

        if (range.startOffset != 0) {
            splitAt(firstElem, range.startOffset);
            lastElem = parent.children[endPos] as HTMLElement;
            startPos++;
            endPos++;
        }
        splitAt(lastElem, finalOffset);
        endPos++;
    } else {
        parent = range.commonAncestorContainer as HTMLElement;

        if (range.startOffset != 0) {
            splitAt(firstElem, range.startOffset);
            startPos++;
            endPos++;
        }
        if (range.endOffset != 0) {
            splitAt(lastElem, range.endOffset);
            endPos++;
        }
    }

    const rng = document.createRange();
    rng.setStart(parent, startPos);
    rng.setEnd(parent, endPos);
    sel.removeAllRanges();
    sel.addRange(rng);

    for (let i = rng.startOffset; i < rng.endOffset; i++) {
        if (parent.childNodes[i].nodeType == Node.ELEMENT_NODE) {
            const child = parent.childNodes[i] as Element;
            switch (format.type) {
                case FormattingType.FOR_COLOR:
                    changeClass(child, FormattingType.FOR_COLOR, format.value as string);
                    break;
                case FormattingType.BACK_COLOR:
                    changeClass(child, FormattingType.BACK_COLOR, format.value as string);
                    break;
                case FormattingType.THICKNESS:
                    changeClass(child, FormattingType.THICKNESS, format.value as string);
                    break;
                case FormattingType.BLINKING:
                    child.classList.toggle(FormattingType.BLINKING, format.value as boolean);
                    break;
                case FormattingType.CROSSED:
                    child.classList.toggle(FormattingType.CROSSED, format.value as boolean);
                    break;
                case FormattingType.UNDERCROSSED:
                    child.classList.toggle(FormattingType.UNDERCROSSED, format.value as boolean);
                    break;
                case FormattingType.ITALIC:
                    child.classList.toggle(FormattingType.ITALIC, format.value as boolean);
                    break;
            }
        }
    }
}
