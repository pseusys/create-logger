import * as assert from "assert";
import * as converter from "../core/converter";
import * as ts from "typescript";
import * as langs from "../core/langs";



describe("Langs test", () => {
    describe("Should acquire proper logging function (console)", () => {
        const test_message = "      Hello, world!";
        it(`Print "${test_message}" to console`, () => {
            langs.toast(test_message);
            assert.ok(true);
        });
    });

    describe("Should convert defined in app classes to CSS", () => {
        ["sty-bold", "for-red", "cross", "ita", "blink", "back-blue"].forEach((value: string) => {
            it(`${value} => "${langs.class_to_CSS(value)}"`, () => {
                assert.ok(true);
            });
        });
    });

    describe("Should pass proper variables and execute default language plugin", () => {
        const entry_list: converter.InEntry[] = [];
        describe("Should make up test array", () => {
            entry_list.push(
                { classes: ["for-green", "under"], value: "Test" },
                { classes: [], value: " " },
                { classes: ["sty-bold", "back-yellow"], value: "string" }
            );
            it(JSON.stringify(entry_list), () => {
                assert.ok(true);
            });
        });

        describe("Should make up Settings object", () => {
            const readable = JSON.stringify(false);
            process.env["readable-check"] = readable;
            const input = JSON.stringify("");
            process.env["code-args-input"] = input;
            it(`Env variables set { readable: ${readable}, args: ${input} }`, () => {
                assert.strictEqual(process.env["readable-check"] == readable, true);
                assert.strictEqual(process.env["code-args-input"] == input, true);
            });
        });

        let lang: string;
        describe("Should choose appropriate language", () => {
            lang = langs.DEF_LANG;
            it(`Default language set to ${lang}`, () => {
                assert.strictEqual(lang == "TypeScript (Node.js)", true);
            });
        });

        let code: string;
        describe("Should generate code in default language", () => {
            const result = langs.construct(lang, [entry_list]);
            code = result.code;
            const gen_code = `Generated code:\n${JSON.stringify(result.code)}`;
            const gen_form = `Generated formats:\n${JSON.stringify(result.formatting)}`;
            it(`${gen_code}\n\n${gen_form}`, () => {
                assert.ok(true);
            });
        });

        describe("Should compile source code", () => {
            const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
            let output = "";
            const capture = (...args) => {
                output += args.map((value: any) => {
                    return value ?? "";
                }).join(" ");
            }
            eval(ts.transpileModule(code, options).outputText + "console.log = capture;\nprint0thLine();");
            it(output, () => {
                assert.ok(true);
            });
        });
    });
});



/**
 * Function, based on methods, tested in this module.
 * It returns result of execution of default language method from console.
 * Results for any other language should match.
 * @param input array of styled with spans strings.
 * @returns generated code output.
 */
export function default_value (input: converter.InEntry[]): string {
    process.env["readable-check"] = JSON.stringify(false);
    process.env["code-args-input"] = JSON.stringify("");
    const result = langs.construct(langs.DEF_LANG, [input]).code;
    const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
    let output = "";
    const capture = (...args) => {
        output += args.map((value: any) => {
            return value ?? "";
        }).join(" ");
    }
    eval(ts.transpileModule(result, options).outputText + "console.log = capture;\nprint0thLine();");
    return output;
}
