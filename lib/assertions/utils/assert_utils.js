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
    },
    sameMembers(arr1, arr2) {
        const arr1Length = arr1.length;
        if(arr1Length !== arr2.length) return false;
        for(let i = 0;i < arr1Length;i++) {
            if(arr1[i] !== arr2[i]) return false;
        }
        return true;
    },
    rejectAssertion(msg) {
        return Promise.reject(new assert.AssertionError({message: msg}));
    }
};
