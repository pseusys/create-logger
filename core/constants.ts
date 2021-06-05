/**
 * Separator, connecting two parts of complex classes.
 * @see CLASS_CODES complex classes
 */
export const SEPARATOR = '-';

/**
 * Supported colors with corresponding ASCII escape numbers.
 * @see ESCAPE_SEPARATOR ASCII escape numbers
 */
export const COLORS = {
    black: "0",
    red: "1",
    green: "2",
    yellow: "3",
    blue: "4",
    magenta: "5",
    cyan: "6",
    white: "7"
}

/**
 * Supported styles with corresponding ASCII escape numbers.
 * @see ESCAPE_SEPARATOR ASCII escape numbers
 */
export const STYLES = {
    bold: "1",
    normal: "22",
    dim: "2"
}

/**
 * Default settings for complex classes. None of the simple classes should be considered as default.
 * @see CLASS_CODES complex classes
 */
export const DEFAULTS = {
    for: "white",
    back: "black",
    sty: "normal"
}



/**
 * ASCII escape numbers-prefixes for complex classes and ASCII escape numbers for simple classes.
 * Complex classes ASCII escape numbers are represented by two numbers.<br/>
 * E.g. ASCII code for background cyan is 46, where 'back' is '4' and 'cyan' is '6'.<br/>
 * E.g. ASCII code for italic style is 3, where 'sty' is '' and 'ita' is '3'.
 * @see CLASS_CODES simple classes
 * @see CLASS_CODES complex classes
 * @see ESCAPE_SEPARATOR ASCII escape numbers
 */
export const PREFIXES = {
    for: "3",
    back: "4",
    sty: "",
    blink: "5",
    cross: "9",
    under: "4",
    ita: "3"
}



/**
 * Function, getting prefix of complex class name.
 * @see CLASS_CODES complex classes
 * @param cls complex class name.
 * @returns prefix, if class name is complex, class name otherwise.
 */
export function getPrefix (cls: string): string {
    if (cls.includes(SEPARATOR)) return cls.split(SEPARATOR)[0];
    else return cls;
}

/**
 * Function, getting postfix of complex class name.
 * @see CLASS_CODES complex classes
 * @param cls complex class name
 * @returns postfix, if class name is complex, class name otherwise.
 */
export function getPostfix (cls: string): string {
    if (cls.includes(SEPARATOR)) return cls.split(SEPARATOR)[1];
    else return "";
}



/**
 * Function to determine whether string is prefix of complex class or not.
 * @see CLASS_CODES complex classes
 * @param pref string to determine.
 * @returns boolean, is prefix or not.
 */
export function multiplePrefix (pref: string): boolean {
    return (pref == 'for') || (pref == 'back') || (pref == 'sty');
}



/**
 * Function to generate all possible class codes.
 * @see CLASS_CODES all class codes
 */
function generateClassCodes () {
    const codes = {};
    for (const prefix in PREFIXES) {
        if ((prefix == 'for') || (prefix == 'back'))
            for (const color in COLORS)
                codes[prefix + SEPARATOR + color] = PREFIXES[prefix] + COLORS[color];
        else if (prefix === 'sty')
            for (const styles in STYLES)
                codes[prefix + SEPARATOR + styles] = PREFIXES[prefix] + STYLES[styles];
        else codes[prefix] = PREFIXES[prefix];
    }
    return codes;
}

/**
 * List of all classes, used to style styled spans. These are following:
 * - `for-black` - black font.
 * - `for-red` - red font.
 * - `for-green` - green font.
 * - `for-yellow` - yellow font.
 * - `for-blue` - blue font.
 * - `for-magenta` - magenta font.
 * - `for-cyan` - cyan font.
 * - `for-white` - white font.
 * - `back-black` - black background.
 * - `back-red` - red background.
 * - `back-green` - green background.
 * `- back-yellow` - yellow background.
 * - `back-blue` - blue background.
 * - `back-magenta` - magenta background.
 * - `back-cyan` - cyan background.
 * - `back-white` - white background.
 * - `sty-bold` - bold.
 * - `sty-normal` - normal.
 * - `sty-dim` - thin.
 * - `blink` - blinking.
 * - `cross` - crossed.
 * - `under` - underscored.
 * - `ita` - italic.
 * The ones, consisting of two parts are referred to as 'complex', the others - as 'simple'.
 * @see terminal styled spans
 */
export const CLASS_CODES = generateClassCodes();
