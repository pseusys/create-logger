interface Entry {
    classes: Array<string>;
    value: string;
}

const ESCAPE_START = "\\033[";
const ESCAPE_SEPARATOR = ";";
const ESCAPE_END = "m";
const ESCAPE_TERMINATE = "0";

const ESCAPE_DICT = {
    [FormattingType.FOR_COLOR]: "3",
    [FormattingType.BACK_COLOR]: "4",
    bold: "1",
    dim: "2",
    [FormattingType.BLINKING]: "5",
    [FormattingType.CROSSED]: "9",
    [FormattingType.UNDERLINED]: "4",
    [FormattingType.ITALIC]: "3",

    black: "0",
    red: "1",
    green: "2",
    yellow: "3",
    blue: "4",
    magenta: "5",
    cyan: "6",
    white: "7"
};

const ESCAPE_DEFAULTS = {
    [FormattingType.FOR_COLOR]: "white",
    [FormattingType.BACK_COLOR]: "black"
};



function classesToStyles(classes: Array<string>): Array<string> {
    const styles = [];
    for (const cls of classes) {
        const pair = cls.split('-');
        if (pair.length == 2) {
            if (pair[0] == 'sty') {
                if (pair[1] == '100') styles.push(ESCAPE_DICT.dim);
                else if (pair[1] == '700') styles.push(ESCAPE_DICT.bold);
            } else if (ESCAPE_DEFAULTS[pair[0]] != pair[1])
                styles.push(ESCAPE_DICT[pair[0]] + ESCAPE_DICT[pair[1]]);
        } else if (pair.length == 1) styles.push(ESCAPE_DICT[pair[0]]);
        else throw new DOMException("Invalid class name: " + cls);
    }
    return styles;
}

function sameClasses(a: Array<string>, b: Array<string>): boolean {
    if ((a == null) || (b == null)) return false;
    if (a.length !== b.length) return false;
    a.sort();
    b.sort();
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
}

function convert(str: Array<Entry>): string {
    let result = "";
    let previousClasses = [];
    for (const entry of str) {
        const styles = classesToStyles(entry.classes);
        let interior = "";
        if (!sameClasses(previousClasses, styles)) {
            if (previousClasses.length > 0) interior += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
            interior += ESCAPE_START;
            interior += styles.join(ESCAPE_SEPARATOR);
            interior += ESCAPE_END;
        }
        interior += entry.value;
        result += interior;
        previousClasses = styles;
    }
    if (previousClasses.length > 0) result += ESCAPE_START + ESCAPE_TERMINATE + ESCAPE_END;
    return result;
}
