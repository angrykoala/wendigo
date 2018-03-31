"use strict";
const assert = require('assert');

module.exports = {
    async assertThrowsAssertionAsync (fn, expectedMsg, actual, expected) {
        return this.assertThrowsAsync (fn, `AssertionError [ERR_ASSERTION]: ${expectedMsg}`, (err) => {
            const expectedCheck = expected ? err.expected === expected : true;
            const actualCheck = actual ? err.actual === actual : true;
            return expectedCheck && actualCheck;
        });
    },
    async assertThrowsAsync (fn, expectedError, cb) {
        let f = () => {};
        try {
            await fn();
        } catch(e) {
            f = () => {
                throw e;
            };
        } finally {
            assert.throws(f, (err) => {
                const errorCheck = expectedError ? err.toString() === expectedError : true;
                const cbCheck = cb ? cb(err) : true;
                return errorCheck && cbCheck;
            });
        }
    }
};
