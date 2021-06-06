import * as assert from "assert";
import * as langs from "../../core/langs";
import * as ts from "typescript";
import * as converter from "../../core/converter";
import { check_code, check_default } from "../langs.test";



describe("TypeScript (Node.js) test", () => {
    const entry_list: converter.InEntry[] = [
        { classes: ["for-red", "cross"], value: "Test" },
        { classes: [], value: " " },
        { classes: ["sty-bold", "back-green"], value: "string" }
    ];

    const def = check_default(entry_list);
    describe("TypeScript non-user-readable implementation to be considered default and should not be tested", () => {
        it(def, () => {
            assert.ok(true);
        });
    });

    describe("Typescript user-readable should match default language output", () => {
        process.env["readable-check"] = JSON.stringify(false);
        process.env["code-args-input"] = JSON.stringify("");
        const result = langs.construct("TypeScript (Node.js)", [entry_list]).code;
        const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
        const lib = ts.transpileModule(result, options).outputText;
        const code = "const { print0thLine } = require('./lib');\nprint0thLine();\n";
        const output = check_code("lib.js", lib, "code.js", code, "node ./code.js");
        it(`${def} == ${output}`, function () {
            assert.strictEqual(def == output, true);
        });
    });
});
