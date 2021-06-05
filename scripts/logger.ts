/**
 * A div, representing default MDL snackbar.
 */
const snackbar = document.getElementById('snackbar');

/**
 * Function, showing a toast message, with button or not.
 * @param text text to be shown.
 * @param message text on toast button.
 * @param callback on toast button clicked function.
 */
export function log (text: string, message?: string, callback?: () => void) {
    const data = {
        message: text,
        actionHandler: callback ?? null,
        actionText: message ?? null,
        timeout: 3000
    };
    snackbar['MaterialSnackbar'].showSnackbar(data);
}
