import * as assert from "assert";
import * as converter from "../../core/converter";
import * as langs from "../../core/langs";
import { check_code } from "../langs.test";



describe("JavaScript (DOM) test", () => {
    const entry_list: converter.InEntry[] = [
        { classes: ["for-magenta", "ita"], value: "Test" },
        { classes: [], value: " " },
        { classes: ["under", "back-cyan"], value: "string" }
    ];
    const lang = "JavaScript (DOM)";

    let captureURSO = "";
    describe("Javascript user-readable should print something in console, no modules, strict, old vars", () => {
        process.env["readable-check"] = JSON.stringify(true);
        process.env["code-args-input"] = JSON.stringify("-s -v old");
        const lib_file = "lib.js";
        const lib_code = `var window = {};\n${langs.construct(lang, [entry_list]).code}\nwindow.print0thLine();\n`;
        const escaped = lib_code.replace(/%c/g, "$c");
        captureURSO = check_code(lib_file, escaped, "code.js", "", "node ./lib.js");
        it(captureURSO.replace(/\$c/g, "%c"), () => {
            assert.ok(true);
        });
    });

    let captureURMN = "";
    describe("Javascript non-user-readable should print something in console, modules, no strict, new vars", () => {
        process.env["readable-check"] = JSON.stringify(false);
        process.env["code-args-input"] = JSON.stringify("-m -v new");
        const lib_file = "lib.mjs", code_file = "code.mjs";
        const lib_code = langs.construct(lang, [entry_list]).code;
        const escaped = lib_code.replace(/%c/g, "$c");
        const code_code = "import { print0thLine } from './lib.mjs';\nprint0thLine();\n";
        captureURMN = check_code(lib_file, escaped, code_file, code_code, "node ./code.mjs");
        it(captureURMN.replace(/\$c/g, "%c"), () => {
            assert.ok(true);
        });
    });

    it("All outputs should match", () => {
        assert.strictEqual(captureURSO == captureURMN, true);
    });
});
