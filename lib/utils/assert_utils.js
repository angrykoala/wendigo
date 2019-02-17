"use strict";

const {AssertionError, WendigoError} = require('../errors');


module.exports = {
    invertify(cb, fnName, msg) {
        return cb().then(() => {
            return this.rejectAssertion(fnName, msg);
        }, (err) => {
            if (err instanceof AssertionError) return Promise.resolve();
            else if (err instanceof WendigoError) {
                const newError = WendigoError.overrideFnName(err, fnName);
                return Promise.reject(newError);
            } else return Promise.reject(err);
        });
    },
    sameMembers(arr1, arr2) {
        const arr1Length = arr1.length;
        if (arr1Length !== arr2.length) return false;
        for (let i = 0; i < arr1Length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    },
    rejectAssertion(fnName, msg, actual, expected) {
        return Promise.reject(new AssertionError(fnName, msg, actual, expected));
    }
};
