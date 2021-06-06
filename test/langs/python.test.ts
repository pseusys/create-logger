import assert from "assert";
import * as converter from "../../core/converter";
import * as langs from "../../core/langs";
import { check_code, check_default } from "../langs.test";



describe("Python3 test", () => {
    const entry_list: converter.InEntry[] = [
        { classes: ["for-blue", "sty-bold"], value: "Test" },
        { classes: [], value: " " },
        { classes: ["cross", "back-white"], value: "string" }
    ];
    const def = check_default(entry_list);
    const lang = "Python3";
    const lib_file = "lib.py", code_file = "code.py";
    const code_code = "from lib import print0thLine\nprint0thLine()\n";

    describe("Python user-readable should match default language output", () => {
        process.env["readable-check"] = JSON.stringify(true);
        process.env["code-args-input"] = JSON.stringify("");
        const lib_code = langs.construct(lang, [entry_list]).code;
        const output = check_code(lib_file, lib_code, code_file, code_code, "python3 ./code.py");
        it(`${def} == ${output}`, function () {
            assert.strictEqual(def == output, true);
        });
    });

    describe("Python non-user-readable should match default language output", () => {
        process.env["readable-check"] = JSON.stringify(false);
        process.env["code-args-input"] = JSON.stringify("");
        const lib_code = langs.construct(lang, [entry_list]).code;
        const output = check_code(lib_file, lib_code, code_file, code_code, "python3 ./code.py");
        it(`${def} == ${output}`, function () {
            assert.strictEqual(def == output, true);
        });
    });
});
