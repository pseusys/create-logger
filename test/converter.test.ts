import * as assert from "assert";
import * as converter from "../core/converter"

describe("Converter test", () => {
    let description: string;
    //TODO: replace with reading from file test.
    const entry_list: converter.Entry[] = [];
    describe("Should make up test string", () => {
        description = "\"This\" (in bold red) ";
        entry_list.push({classes: ["sty-bold", "for-red"], value: "This "});

        description += "\"is\" (crossed in italic) ";
        entry_list.push({classes: ["cross", "ita"], value: "is "});

        description += "\"a\" (green on yellow) ";
        entry_list.push({classes: ["for-green", "back-yellow"], value: "a "});

        description += "\"test\" (blinking on blue) ";
        entry_list.push({classes: ["blink", "back-blue"], value: "test "});

        description += "\"string\" (dim underlined).";
        entry_list.push({classes: ["sty-dim", "under"], value: "string."});

       it(description, () => {
           assert.ok(true);
       });
    });

    let test_string: string;
    describe("Should compile test string", () => {
        test_string = converter.convert(entry_list);
        it(test_string.replace(/\\033/g, "\u001b"), () => {
            assert.ok(true);
        });
    });
});
