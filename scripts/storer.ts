/**
 * Flag, symbolizing whether user allowed saving cookies or not. If not set, no cookies will be saved.
 */
let allowed = Boolean(get('allowed'));

/**
 * Function, asking user to allow cookies. It is called once, after window loaded.
 */
export function check () {
    if (!allowed) {
        alert("For storing user preferences and presets this site uses cookies.");
        allowed = true;
        set('allowed', true);
    }
}



/**
 * Function to get parameter from storage.
 * @param key string key
 */
export function get (key: string): any | null {
    return JSON.parse(window.localStorage.getItem(key));
}

/**
 * Function to set parameter to storage.
 * @param key string key.
 * @param value any value, will be saved as JSON.
 */
export function set (key: string, value: any): void {
    if (allowed) window.localStorage.setItem(key, JSON.stringify(value));
}
