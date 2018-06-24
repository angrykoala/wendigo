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
    },
    stringify(element) {
        if(typeof element === 'object' && !(element instanceof RegExp)) {
            element = JSON.stringify(element);
        }
        return String(element);
    },
    delay(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    },
    compareObjects(obj1, obj2) {
        if(!obj1 || !obj2) return false;
        const k1 = Object.keys(obj1);
        const k2 = Object.keys(obj2);
        if(k1.length !== k2.length) return false;
        for(const k of k1) {
            if(obj1[k] !== obj2[k]) return false;
        }
        return true;
    }
};
