import * as assert from "assert";
import * as converter from "../../core/converter";
import * as langs from "../../core/langs";
import * as ts from "typescript";



/**
 * Function to capture js plugin output.
 * @param code js code
 * @returns console output
 */
function capture_output (code: string): string {
    let output = "";
    const capture = (...args) => {
        output += args.map((value: any) => {
            return value ?? "";
        }).join(" ");
    }
    eval(code + "console.log = capture;\nprint0thLine();");
    return output;
}

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
        captureURSO = capture_output(langs.construct(lang, [entry_list]).code);
        it(captureURSO, () => {
            assert.ok(true);
        });
    });

    let captureURMN = "";
    describe("Javascript non-user-readable should print something in console, modules (compiled with TS), no strict, new vars", () => {
        process.env["readable-check"] = JSON.stringify(false);
        process.env["code-args-input"] = JSON.stringify("-m -v new");
        const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
        const code = ts.transpileModule(langs.construct(lang, [entry_list]).code, options).outputText;
        captureURMN = capture_output(code);
        it(captureURMN, () => {
            assert.ok(true);
        });
    });

    it("All outputs should match", () => {
        assert.strictEqual(captureURSO == captureURMN, true);
    });
});
