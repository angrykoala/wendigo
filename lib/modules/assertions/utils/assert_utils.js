"use strict";

const Errors = require('../../../errors/errors');
const ErrorFactory = require('../../../errors/error_factory');

module.exports = {
    invertify(cb, msg) {
        return cb().then(() => {
            return this.rejectAssertion(msg);
        }, (err) => {
            if (err instanceof Errors.AssertionError) return Promise.resolve();
            else return Promise.reject(err);
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
    rejectAssertion(msg, actual, expected) {
        return Promise.reject(ErrorFactory.generateAssertionError(msg, actual, expected));
    }
};
