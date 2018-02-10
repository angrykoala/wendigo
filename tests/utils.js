"use strict";
const assert = require('assert');

module.exports = {
    async assertThrowsAssertionAsync(fn, expected) {
        return this.assertThrowsAsync(fn, `AssertionError [ERR_ASSERTION]: ${expected}`);
    },
    async assertThrowsAsync(fn, expected) {
        let f = () => {};
        try {
            await fn();
        } catch(e) {
            f = () => {
                throw e;
            };
        } finally {
            assert.throws(f, (err) => {
                if(expected) {
                    return err.toString() === expected;
                } else return true;
            });
        }
    }
};
