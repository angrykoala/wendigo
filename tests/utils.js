"use strict";
const assert = require('assert');

module.exports = {
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
                    return err.toString() === `AssertionError [ERR_ASSERTION]: ${expected}`;
                } else return true;
            });
        }
    }
};
