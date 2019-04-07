import * as assertUtils from '../../utils/assert_utils';
import BrowserLocalStorageAssertions from './local_storage_assertions';
import { arrayfy } from '../../utils/utils';

export default class BrowserLocalStorageNotAssertions {
    private localStorageAssertions: BrowserLocalStorageAssertions;

    constructor(localStorageAssertions: BrowserLocalStorageAssertions) {
        this.localStorageAssertions = localStorageAssertions;
    }

    public exist(key: string | Array<string>, msg?: string): Promise<void> {
        const keyList = arrayfy(key);
        if (!msg) {
            const itemText = keyList.length === 1 ? "item" : "items";
            msg = `Expected ${itemText} "${keyList.join(" ")}" not to exist in localStorage.`;
        }
        return assertUtils.invertify(() => {
            return this.localStorageAssertions.exist(keyList, "");
        }, "assert.localStorage.not.exist", msg);
    }

    public value(key: string | { [s: string]: string }, expected?: string, msg?: string): Promise<void> {
        let keyVals: { [s: string]: string } = {};
        if (typeof key === "string") {
            keyVals[key] = expected as string;
        } else {
            if (typeof expected === "string") msg = expected;
            keyVals = key;
        }

        if (!msg) {
            const keys = Object.keys(keyVals);
            const itemText = keys.length === 1 ? "item" : "items";
            const valuesText = keys.length === 1 ? "value" : "values";
            const expectedVals = Object.values(keyVals).join(" ");
            msg = `Expected ${itemText} "${keys.join(" ")}" not to have ${valuesText} "${expectedVals}" in localStorage.`;
        }

        return assertUtils.invertify(() => {
            return this.localStorageAssertions.value(keyVals, "");
        }, "assert.localStorage.not.value", msg);
    }

    public length(expected: number, msg?: string): Promise<void> {
        if (!msg) {
            const itemText = expected === 1 ? "item" : "items";
            msg = `Expected localStorage not to have ${expected} ${itemText}.`;
        }
        return assertUtils.invertify(() => {
            return this.localStorageAssertions.length(expected, "");
        }, "assert.localStorage.not.length", msg);
    }

    public empty(msg?: string): Promise<void> {
        if (!msg) msg = `Expected localStorage not to be empty.`;
        return assertUtils.invertify(() => {
            return this.localStorageAssertions.empty("");
        }, "assert.localStorage.not.empty", msg);
    }
}
