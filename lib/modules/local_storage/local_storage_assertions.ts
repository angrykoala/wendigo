import BrowserLocalStorageNotAssertions from './local_storage_not_assertions';
import { arrayfy } from '../../utils/utils';
import BrowserLocalStorage from './browser_local_storage';
import { AssertionError } from '../../errors';

export default class BrowserLocalStorageAssertions {
    private _localStorage: BrowserLocalStorage;
    public readonly not: BrowserLocalStorageNotAssertions;

    constructor(localStorage: BrowserLocalStorage) {
        this._localStorage = localStorage;
        this.not = new BrowserLocalStorageNotAssertions(this);
    }

    public async exist(key: string | Array<string>, msg?: string): Promise<void> {
        const keyList = arrayfy(key);
        const itemWord = keyList.length === 1 ? "item" : "items";
        const res = await Promise.all(keyList.map((k) => {
            return this._localStorage.getItem(k);
        }));
        const nullValues = res.filter((r) => {
            return r === null;
        });
        if (nullValues.length !== 0) {
            if (!msg) msg = `Expected ${itemWord} "${keyList.join(" ")}" to exist in localStorage.`;
            throw new AssertionError("assert.localStorage.exist", msg);
        }
    }

    public async value(key: string | { [s: string]: string }, expected?: string, msg?: string): Promise<void> {
        let keyVals: { [s: string]: string } = {};
        if (typeof key === "string") {
            keyVals[key] = expected as string;
        } else {
            if (typeof expected === "string") msg = expected;
            keyVals = key;
        }
        const keys = Object.keys(keyVals);
        const values = await Promise.all(keys.map(async (k) => {
            const val = await this._localStorage.getItem(k);
            return [k, val] as [string, string | null];
        }));
        for (const v of values) {
            if (v[1] !== keyVals[v[0]]) {
                const expectedVals = Object.values(keyVals).join(" ");
                if (!msg) {
                    const itemText = keys.length === 1 ? "item" : "items";
                    const valuesText = keys.length === 1 ? "value" : "values";
                    const realVals = values.map(val => String(val[1])).join(" ");
                    msg = `Expected ${itemText} "${keys.join(" ")}" to have ${valuesText} "${expectedVals}" in localStorage, "${realVals}" found.`; // eslint-disable-line max-len
                }
                throw new AssertionError("assert.localStorage.value", msg);
            }
        }
    }

    public async length(expected: number, msg?: string): Promise<void> {
        const res = await this._localStorage.length();
        if (res !== expected) {
            if (!msg) msg = `Expected localStorage to have ${expected} items, ${res} found.`;
            throw new AssertionError("assert.localStorage.length", msg, res, expected);
        }
    }

    public async empty(msg?: string): Promise<void> {
        const res = await this._localStorage.length();
        if (res !== 0) {
            if (!msg) {
                const itemText = res === 1 ? "item" : "items";
                msg = `Expected localStorage to be empty, ${res} ${itemText} found.`;
            }
            throw new AssertionError("assert.localStorage.empty", msg);
        }
    }
}
