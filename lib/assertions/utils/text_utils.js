"use strict";

module.exports = {
    matchText(text, expected) {
        if(expected instanceof RegExp) {
            return expected.test(text);
        } else return text === expected;

    }

};
