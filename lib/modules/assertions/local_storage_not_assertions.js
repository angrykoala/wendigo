"use strict";

const assertUtils = require('./utils/assert_utils');

module.exports = class BrowserLocalStorageNotAssertions {
    constructor(localStorageAssertions) {
        this._localStorageAssertions = localStorageAssertions;
    }

    exist(key, msg) {
        if (!Array.isArray(key)) key = [key];
        if (!msg) {
            const itemText = key.length === 1 ? "item" : "items";
            msg = `Expected ${itemText} "${key.join(" ")}" not to exist in localStorage.`;
        }
        return assertUtils.invertify(() => {
            return this._localStorageAssertions.exist(key, "");
        }, msg);
    }

    value(key, expected, msg) {
        let keyVals = {};
        if (typeof key === "string") {
            keyVals[key] = expected;
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
            return this._localStorageAssertions.value(keyVals, "");
        }, msg);
    }

    length(expected, msg) {
        if (!msg) {
            const itemText = expected === 1 ? "item" : "items";
            msg = `Expected localStorage not to have ${expected} ${itemText}.`;
        }
        return assertUtils.invertify(() => {
            return this._localStorageAssertions.length(expected, "");
        }, msg);
    }

    empty(msg) {
        if (!msg) msg = `Expected localStorage not to be empty.`;
        return assertUtils.invertify(() => {
            return this._localStorageAssertions.empty("");
        }, msg);
    }
};
