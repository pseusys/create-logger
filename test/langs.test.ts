import * as assert from "assert";
import * as converter from "../core/converter";
import * as langs from "../core/langs";

import * as ts from "typescript";
import { execSync } from "child_process";
import * as fs from 'fs';



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
            const res = check_code("./lib.js", ts.transpileModule(code, options).outputText, "./exec.js", "const { print0thLine } = require(\"./lib\");\nprint0thLine();\n", `node ./exec.js`);
            it(res, () => {
                assert.ok(true);
            });
        });
    });
});



/**
 * Function, running and checking code in a special folder, capturing STDOUT and flushing it as a result.
 * @param lib_name name of the file, where the code of the logger will be placed.
 * @param lib_code code of the logger.
 * @param code_name name of the file, where the calling methods will be placed.
 * @param code_code calling methods.
 * @param cmd bash command, calling compiler of specified lang and executing code_name file with lib_name as a lib.
 * @returns process STDOUT without trailing new line.
 */
export function check_code (lib_name: string, lib_code: string, code_name: string, code_code: string, cmd: string): string {
    const temp = "./temp/";
    if (!fs.existsSync(temp)) fs.mkdirSync(temp);
    fs.writeFileSync(temp + lib_name, lib_code);
    fs.writeFileSync(temp + code_name, code_code);
    const result = execSync(`cd ${temp} && ${cmd}`).toString("ascii");
    fs.rmSync(temp, { recursive: true, force: true });
    return result.slice(0, -1);
}

/**
 * Function, based on methods, tested in this module.
 * It returns result of execution of default language method from console.
 * Results for any other language should match.
 * @param input array of styled with spans strings.
 * @returns generated code output.
 */
export function check_default (input: converter.InEntry[]): string {
    process.env["readable-check"] = JSON.stringify(false);
    process.env["code-args-input"] = JSON.stringify("");
    const options = { compilerOptions: { module: ts.ModuleKind.CommonJS }};
    const lib = ts.transpileModule(langs.construct(langs.DEF_LANG, [input]).code, options).outputText;
    const code = "const { print0thLine } = require('./lib');\nprint0thLine();\n";
    return check_code("lib.js", lib, "code.js", code, "node ./code.js");
}
