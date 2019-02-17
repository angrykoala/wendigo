"use strict";

const assertUtils = require('./assert_utils');
const utils = require('../utils/utils');

const countCases = {
    equal: "equal",
    atLeast: "atLeast",
    atMost: "atMost",
    both: "both"
};

module.exports = {
    parseCountInput(count) {
        if (utils.isNumber(count)) {
            count = {
                equal: Number(count)
            };
        }
        const countCase = this._getCountCase(count);
        count.case = countCase;
        return count;
    },

    makeAssertion(selector, countData, elementsFound, msg) {
        switch (countData.case) {
            case countCases.equal:
                return this._equalAssertion(countData, elementsFound, msg, selector);
            case countCases.atLeast:
                return this._atLeastAssertion(countData, elementsFound, msg, selector);
            case countCases.atMost:
                return this._atMostAssertion(countData, elementsFound, msg, selector);
            case countCases.both:
                return this._bothAssertion(countData, elementsFound, msg, selector);
        }
    },

    _equalAssertion(countData, elementsFound, msg, selector) {
        const expected = Number(countData.equal);
        if (elementsFound !== expected) {
            if (!msg) msg = `Expected selector "${selector}" to find exactly ${countData.equal} elements, ${elementsFound} found`;
            return assertUtils.rejectAssertion("assert.elements", msg, elementsFound, expected);
        }
    },

    _atLeastAssertion(countData, elementsFound, msg, selector) {
        const expected = Number(countData.atLeast);
        if (elementsFound < expected) {
            if (!msg) msg = `Expected selector "${selector}" to find at least ${countData.atLeast} elements, ${elementsFound} found`;
            return assertUtils.rejectAssertion("assert.elements", msg);
        }
    },

    _atMostAssertion(countData, elementsFound, msg, selector) {
        const expected = Number(countData.atMost);
        if (elementsFound > expected) {
            if (!msg) msg = `Expected selector "${selector}" to find up to ${countData.atMost} elements, ${elementsFound} found`;
            return assertUtils.rejectAssertion("assert.elements", msg);
        }
    },

    _bothAssertion(countData, elementsFound, msg, selector) {
        const most = Number(countData.atMost);
        const least = Number(countData.atLeast);
        if (elementsFound < least || elementsFound > most) {
            if (!msg) msg = `Expected selector "${selector}" to find between ${countData.atLeast} and ${countData.atMost} elements, ${elementsFound} found`; // eslint-disable-line max-len
            return assertUtils.rejectAssertion("assert.elements", msg);
        }
    },

    _getCountCase(count) {
        let countCase = null;
        if (utils.isNumber(count.equal)) {
            countCase = countCases.equal;
        } else {
            if (utils.isNumber(count.atLeast)) {
                countCase = countCases.atLeast;
            }
            if (utils.isNumber(count.atMost)) {
                countCase = countCase ? countCases.both : countCases.atMost;
            }
        }
        return countCase;
    }
};
