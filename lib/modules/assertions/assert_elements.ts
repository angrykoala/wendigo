import { rejectAssertion } from './assert_utils';
import { isNumber } from './utils';

enum CountCase {
    equal = "equal",
    atLeast = "atLeast",
    atMost = "atMost",
    both = "both"
}

interface CountConfig {
    equal?: number;
    atLeast?: number;
    atMost?: number;
}

export function parseCountInput(count: CountConfig | number): CountConfig {
    if (isNumber(count)) {
        count = {
            equal: Number(count)
        };
    }
    return count;
    // const countCase = this._getCountCase(count);
    // count.case = countCase;
}

export function getCountCase(count: CountConfig): CountCase | null {
    let countCase: CountCase | null = null;
    if (isNumber(count.equal)) {
        countCase = CountCase.equal;
    } else {
        if (isNumber(count.atLeast)) {
            countCase = CountCase.atLeast;
        }
        if (isNumber(count.atMost)) {
            countCase = countCase ? CountCase.both : CountCase.atMost;
        }
    }
    return countCase;
}

export function makeAssertion(selector, countData, elementsFound, msg) {
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
}

function _equalAssertion(countData, elementsFound, msg, selector) {
    const expected = Number(countData.equal);
    if (elementsFound !== expected) {
        if (!msg) msg = `Expected selector "${selector}" to find exactly ${countData.equal} elements, ${elementsFound} found`;
        return rejectAssertion("assert.elements", msg, elementsFound, expected);
    }
}

function _atLeastAssertion(countData, elementsFound, msg, selector) {
    const expected = Number(countData.atLeast);
    if (elementsFound < expected) {
        if (!msg) msg = `Expected selector "${selector}" to find at least ${countData.atLeast} elements, ${elementsFound} found`;
        return rejectAssertion("assert.elements", msg);
    }
}

function _atMostAssertion(countData, elementsFound, msg, selector) {
    const expected = Number(countData.atMost);
    if (elementsFound > expected) {
        if (!msg) msg = `Expected selector "${selector}" to find up to ${countData.atMost} elements, ${elementsFound} found`;
        return rejectAssertion("assert.elements", msg);
    }
}

function _bothAssertion(countData, elementsFound, msg, selector) {
    const most = Number(countData.atMost);
    const least = Number(countData.atLeast);
    if (elementsFound < least || elementsFound > most) {
        if (!msg) msg = `Expected selector "${selector}" to find between ${countData.atLeast} and ${countData.atMost} elements, ${elementsFound} found`; // eslint-disable-line max-len
        return rejectAssertion("assert.elements", msg);
    }
}
