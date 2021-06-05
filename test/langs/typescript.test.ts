import * as assert from "assert";
import * as langs from "../../core/langs";
import * as ts from "typescript";
import * as converter from "../../core/converter";
import { default_value } from "../langs.test";



describe("TypeScript (Node.js) test", () => {
    it("TypeScript non-user-readable implementation to be considered default and should not be tested", () => {
        assert.ok(true);
    });

    const entry_list: converter.InEntry[] = [
        { classes: ["for-red", "cross"], value: "Test" },
        { classes: [], value: " " },
        { classes: ["sty-bold", "back-green"], value: "string" }
    ];

    describe("Typescript user-readable should match default language output", () => {
        process.env["readable-check"] = JSON.stringify(false);
        process.env["code-args-input"] = JSON.stringify("");
        const result = langs.construct("TypeScript (Node.js)", [entry_list]).code;
        const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
        let output = "";
        const capture = (...args) => {
            output += args.map((value: any) => {
                return value ?? "";
            }).join(" ");
        }
        eval(ts.transpileModule(result, options).outputText + "console.log = capture;\nprint0thLine();");
        const default_lang = default_value(entry_list);
        it(`${default_lang} == ${output}`, function () {
            assert.strictEqual(default_lang == output, true);
        });
    });
});
