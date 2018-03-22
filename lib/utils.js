"use strict";

module.exports = {
    isNumber(n) {
        return !Number.isNaN(Number(n));
    },
    promiseSerial(funcs) {
        return funcs.reduce((promise, func) => {
            return promise.then(result => func().then(Array.prototype.concat.bind(result)));
        }, Promise.resolve([]));
    }
};
