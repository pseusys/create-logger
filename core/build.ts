import { LANGUAGES, TYPES } from "./langs";
import { COLORS, DEFAULTS, STYLES } from "./constants";

import en from "../trans/en.json";
import ru from "../trans/ru.json";



export const TRANSLATIONS = {
    en: "English 🇬🇧",
    ru: "Русский 🇷🇺"
}

export const LITERALS = {
    en: en,
    ru: ru
};



// For passing variables to LESS:

export const LESS_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES)
};

Object.keys(DEFAULTS).forEach((value) => {
    LESS_VARS["def-" + value] = DEFAULTS[value];
});



// For passing variables to PUG:

export const PUG_VARS = {
    colors: Object.keys(COLORS),
    styles: Object.keys(STYLES),

    languages: Object.keys(LANGUAGES),
    types: Object.values(TYPES),

    literals: LITERALS.en,
    translations: TRANSLATIONS,

    build: '#'
};
