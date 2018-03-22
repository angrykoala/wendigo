"use strict";
const assert = require('assert');

module.exports = {
    invertify(cb, msg) {
        return cb().then(() => {
            return Promise.reject(new assert.AssertionError({message: msg}));
        }, (err) => {
            if(err instanceof assert.AssertionError) return Promise.resolve();
            else return Promise.reject(err);
        });
    }

};