"use strict";

module.exports = {
    isNumber(n) {
        return !Number.isNaN(Number(n));
    },
    serialize(element) {
        if(typeof element === 'object') {
            return JSON.stringify(element);
        } else return String(element);
    },
    promiseSerial(funcs) {
        return funcs.reduce((promise, func) => {
            return promise.then(result => func().then(Array.prototype.concat.bind(result)));
        }, Promise.resolve([]));
    },
    matchText(text, expected) {
        if(expected instanceof RegExp) {
            return expected.test(text);
        } else return text === expected;
    },
    matchTextList(list, expected) {
        for(const text of list) {
            if(this.matchText(text, expected)) return true;
        }
        return false;
    }
};
