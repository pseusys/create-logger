let allowed = Boolean(get('allowed'));

export function check () {
    if (!allowed) {
        alert("For storing user preferences and presets this site uses cookies.");
        allowed = true;
        set('allowed', true);
    }
}

export function get (key: string): string | boolean | null {
    return window.localStorage.getItem(key);
}

export function set (key: string, value: string | boolean): void {
    check();
    window.localStorage.setItem(key, String(value));
}
