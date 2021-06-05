import * as assert from "assert";
import * as utils from "../core/utils";



describe("Utils test", () => {
    const test_array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    describe("Utils.areArraysEqual():", () => {
        const other_array = [...test_array].sort(() => (Math.random() > .5) ? 1 : -1);
        it(`${test_array} == ${other_array}`, () => {
            const equal = utils.are_arrays_equal(test_array, other_array);
            assert.strictEqual(equal, true);
        });

        const another_array = [...other_array];
        for (let i = 1; i < 1 + Math.random() * 9; i++) {
            another_array[Math.round(Math.random() * 9)] -= Math.round(10 + Math.random() * 9);
        }
        it(`${test_array} != ${another_array}`, () => {
            const equal = utils.are_arrays_equal(test_array, another_array);
            assert.strictEqual(equal, false);
        });
    });

    describe("Utils.getSameElements():", () => {
        const included_array = [1, 4, 9];
        it(`${included_array} in ${test_array}`, () => {
            const equal = utils.get_same_elements(test_array, included_array);
            assert.strictEqual(utils.are_arrays_equal(equal, included_array), true);
        });

        const excluded_array = [-1, -4, -9];
        it(`${excluded_array} not in ${test_array}`, () => {
            const equal = utils.get_same_elements(test_array, excluded_array);
            assert.strictEqual(utils.are_arrays_equal(equal, []), true);
        });
    });

    describe("Utils.replace_between():", () => {
        const include_string = '"Include string -> {ERROR} <- here."';
        const included_string = '"Included!"';
        it(`${included_string} in ${include_string}`, () => {
            const start = include_string.indexOf('{');
            const end = include_string.indexOf('}');
            const include = utils.replace_between(include_string, start, end, included_string);
            assert.strictEqual(include.includes('{ERROR}'), false);
            assert.strictEqual(include.includes(included_string), true);
        });
    });
});
