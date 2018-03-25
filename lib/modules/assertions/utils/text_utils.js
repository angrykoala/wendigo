"use strict";

module.exports = {
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
    }

};
