import BrowserLocalStorageNotAssertions from './local_storage_not_assertions';
import * as assertUtils from '../../utils/assert_utils';
import { arrayfy } from '../../utils/utils';
import { Browser } from 'puppeteer';
import BrowserLocalStorage from './browser_local_storage';

export default class BrowserLocalStorageAssertions {
    private _localStorage: BrowserLocalStorage;
    public readonly not: BrowserLocalStorageNotAssertions;
    constructor(browser: Browser, localStorage: BrowserLocalStorage) {
        this._localStorage = localStorage;
        this.not = new BrowserLocalStorageNotAssertions(this);
    }

    public exist(key: string | Array<string>, msg?: string): Promise<void> {
        const keyList = arrayfy(key);
        const itemWord = keyList.length === 1 ? "item" : "items";
        return Promise.all(keyList.map((k) => {
            return this._localStorage.getItem(k);
        })).then((res) => {
            const nullValues = res.filter((r) => {
                return r === null;
            });
            if (nullValues.length === 0) return Promise.resolve();
            else {
                if (!msg) msg = `Expected ${itemWord} "${keyList.join(" ")}" to exist in localStorage.`;
                return assertUtils.rejectAssertion("assert.localStorage.exist", msg);
            }
        });
    }

    public value(key: string | { [s: string]: string }, expected?: string, msg?: string): Promise<void> {
        let keyVals: { [s: string]: string } = {};
        if (typeof key === "string") {
            keyVals[key] = expected as string;
        } else {
            if (typeof expected === "string") msg = expected;
            keyVals = key;
        }
        const keys = Object.keys(keyVals);
        return Promise.all(keys.map((k) => {
            return this._localStorage.getItem(k).then((val) => {
                return [k, val] as [string, string | null];
            });
        })).then((values) => {
            for (const v of values) {
                if (v[1] !== keyVals[v[0]]) {
                    const expectedVals = Object.values(keyVals).join(" ");
                    if (!msg) {
                        const itemText = keys.length === 1 ? "item" : "items";
                        const valuesText = keys.length === 1 ? "value" : "values";
                        const realVals = values.map(val => String(val[1])).join(" ");
                        msg = `Expected ${itemText} "${keys.join(" ")}" to have ${valuesText} "${expectedVals}" in localStorage, "${realVals}" found.`; // eslint-disable-line max-len
                    }
                    return assertUtils.rejectAssertion("assert.localStorage.value", msg);
                }
            }
            return Promise.resolve();
        });
    }

    public length(expected: number, msg?: string): Promise<void> {
        return this._localStorage.length().then((res) => {
            if (res !== expected) {
                if (!msg) msg = `Expected localStorage to have ${expected} items, ${res} found.`;
                return assertUtils.rejectAssertion("assert.localStorage.length", msg, res, expected);
            }
            return Promise.resolve();
        });
    }

    public empty(msg?: string): Promise<void> {
        return this._localStorage.length().then((res) => {
            if (res !== 0) {
                if (!msg) {
                    const itemText = res === 1 ? "item" : "items";
                    msg = `Expected localStorage to be empty, ${res} ${itemText} found.`;
                }
                return assertUtils.rejectAssertion("assert.localStorage.empty", msg);
            }
            return Promise.resolve();
        });
    }
}
