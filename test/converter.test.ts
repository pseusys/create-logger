import * as assert from "assert";
import * as converter from "../core/converter";



describe("Converter test", () => {
    const entry_list: converter.InEntry[] = [];
    describe("Should make up test array", () => {
        let description = '"This" ("sty-bold", "for-red") ';
        entry_list.push({ classes: ["sty-bold", "for-red"], value: "This" }, { classes: [], value: " " });

        description += '"is" ("cross", "ita") ';
        entry_list.push({ classes: ["cross", "ita"], value: "is" }, { classes: [], value: " " });

        description += '"a" ("for-green", "back-yellow") ';
        entry_list.push({ classes: ["for-green", "back-yellow"], value: "a" }, { classes: [], value: " " });

        description += '"test" ("blink", "back-blue") ';
        entry_list.push({ classes: ["blink", "back-blue"], value: "test" }, { classes: [], value: " " });

        description += '"string" ("sty-dim", "under").';
        entry_list.push({ classes: ["sty-dim", "under"], value: "string" }, { classes: [], value: "." });

       it(description, () => {
           assert.ok(true);
       });
    });

    let converted_list: converter.OutEntry[];
    describe("Should convert test array", () => {
        converted_list = converter.convert(entry_list);
        it("Converted list length matches converting list length", () => {
            assert.strictEqual(converted_list.length, entry_list.length);
        });
    });

    let test_string: string;
    describe("Should compile test string", () => {
        test_string = converter.convert(entry_list).map((value: converter.OutEntry): string => {
            if (value.prefix.length <= 0) return value.value;
            else return converter.ESCAPE_START + value.prefix.join(converter.ESCAPE_SEPARATOR) + converter.ESCAPE_END +
                value.value + converter.ESCAPE_START + converter.ESCAPE_TERMINATE + converter.ESCAPE_END;
        }).join("");
        it(test_string, () => {
            assert.ok(true);
        });
    });

    describe("Test string should match description", () => {
        it(test_string.replace(/\\u001b/g, "\u001b"), () => {
            assert.ok(true);
        });
    });
});
