const snackbar = document.getElementById('snackbar');

export function log (text: string, message?: string, callback?: () => void) {
    const data = {
        message: text,
        actionHandler: callback ?? null,
        actionText: message ?? null,
        timeout: 5000
    };
    snackbar['MaterialSnackbar'].showSnackbar(data);
}
