"use strict";
const utils = require('../utils');
const assert = require('assert');

const countCases = {
    equal: "equal",
    atLeast: "atLeast",
    atMost: "atMost",
    both: "both"
};

module.exports = {
    parseCountInput(count) {
        if(utils.isNumber(count)) {
            count = {
                equal: Number(count)
            };
        }
        const countCase = this._getCountCase(count);
        count["case"] = countCase;
        return count;
    },

    makeAssertion(countData, elementsFound, msg) {
        switch(countData.case) {
            case countCases.equal:
                assert.strictEqual(elementsFound, Number(countData.equal), msg);
                break;
            case countCases.atLeast:
                assert(elementsFound >= countData.atLeast, msg);
                break;
            case countCases.atMost:
                assert(elementsFound <= countData.atMost, msg);
                break;
            case countCases.both:
                assert(elementsFound >= countData.atLeast && elementsFound <= countData.atMost, msg);
                break;
        }
    },

    getAssertionMessage(selector, countData, elementsFound) {
        switch(countData.case) {
            case countCases.equal:
                return `Expected selector "${selector}" to find exactly ${countData.equal} elements, ${elementsFound} found`;
            case countCases.atLeast:
                return `Expected selector "${selector}" to find at least ${countData.atLeast} elements, ${elementsFound} found`;
            case countCases.atMost:
                return `Expected selector "${selector}" to find up to ${countData.atMost} elements, ${elementsFound} found`;
            case countCases.both:
                return `Expected selector "${selector}" to find between ${countData.atLeast} and ${countData.atMost} elements, ${elementsFound} found`;
        }
    },

    _getCountCase(count) {
        let countCase = null;
        if(utils.isNumber(count.equal)) {
            countCase = countCases.equal;
        } else{
            if(utils.isNumber(count.atLeast)) {
                countCase = countCases.atLeast;
            }
            if(utils.isNumber(count.atMost)) {
                countCase = countCase ? countCases.both : countCases.atMost;
            }
        }

        return countCase;
    }


};
