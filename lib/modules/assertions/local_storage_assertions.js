"use strict";

const BrowserLocalStorageNotAssertions = require('./local_storage_not_assertions');
const assertUtils = require('./utils/assert_utils');

module.exports = class BrowserLocalStorageAssertions {

    constructor(browserAssertions) {
        this._localStorage = browserAssertions._browser.localStorage;
        this.not = new BrowserLocalStorageNotAssertions(this);
    }

    exist(key, msg) {
        if(!Array.isArray(key)) key = [key];
        const itemWord = key.length === 1 ? "item" : "items";
        return Promise.all(key.map((k) => {
            return this._localStorage.getItem(k);
        })).then((res) => {
            const nullValues = res.filter((r) => {
                return r === null;
            });
            if(nullValues.length === 0) return Promise.resolve();
            else {
                if(!msg) msg = `Expected ${itemWord} "${key.join(" ")}" to exist in localStorage.`;
                return assertUtils.rejectAssertion(msg);
            }
        });
    }

    value(key, expected, msg) {
        let keyVals = {};
        if(typeof key === "string") {
            keyVals[key] = expected;
        } else {
            if(typeof expected === "string") msg = expected;
            keyVals = key;
        }
        const keys = Object.keys(keyVals);
        return Promise.all(keys.map((k) => {
            return this._localStorage.getItem(k).then((val) => {
                return [k, val];
            });
        })).then((values) => {
            for(const v of values) {
                if(v[1] !== keyVals[v[0]]) {
                    const expectedVals = Object.values(keyVals).join(" ");
                    if(!msg) {
                        const itemText = keys.length === 1 ? "item" : "items";
                        const valuesText = keys.length === 1 ? "value" : "values";
                        const realVals = values.map(v => String(v[1])).join(" ");
                        msg = `Expected ${itemText} "${keys.join(" ")}" to have ${valuesText} "${expectedVals}" in localStorage, "${realVals}" found.`;
                    }
                    return assertUtils.rejectAssertion(msg, expectedVals, keys);
                }
            }
            return Promise.resolve();
        });


    }

    length(expected, msg) {
        return this._localStorage.length().then((res) => {
            if(res !== expected) {
                if(!msg) msg = `Expected localStorage to have ${expected} items, ${res} found.`;
                return assertUtils.rejectAssertion(msg, expected, res);
            }
        });
    }

    empty(msg) {
        return this._localStorage.length().then((res) => {
            if(res !== 0) {
                if(!msg) {
                    const itemText = res === 1 ? "item" : "items";
                    msg = `Expected localStorage to be empty, ${res} ${itemText} found.`;
                }
                return assertUtils.rejectAssertion(msg);
            }
        });
    }
};
