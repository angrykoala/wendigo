"use strict";

const assert = require('assert');

module.exports = {
    isNumber(n) {
        return !Number.isNaN(Number(n));
    },
    rejectAssertion(msg) {
        return Promise.reject(new assert.AssertionError({message: msg}));
    },
    promiseSerial(funcs) {
        return funcs.reduce((promise, func) => {
            return promise.then(result => func().then(Array.prototype.concat.bind(result)));
        }, Promise.resolve([]));
    }
};
