import { log } from "./logger";



/**
 * Flag, symbolizing whether user allowed saving cookies or not. If not set, no cookies will be saved.
 */
let allowed = get('allowed', false);

/**
 * Function, asking user to allow cookies. It is called once, after window loaded.
 */
export function check () {
    if (!allowed) {
        log("For storing user preferences and presets this site uses cookies.");
        allowed = true;
        set('allowed', true);
    }
}



/**
 * Function to get parameter from storage.
 * @param key string key
 * @param def default return value
 */
export function get <T> (key: string, def: T): T | null {
    const item = window.localStorage.getItem(key);
    if (item == null) return def;
    else return JSON.parse(item);
}

/**
 * Function to set parameter to storage.
 * @param key string key.
 * @param value any value, will be saved as JSON.
 */
export function set <T> (key: string, value: T): void {
    if (allowed) window.localStorage.setItem(key, JSON.stringify(value));
}
