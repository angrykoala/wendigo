import { AssertionError } from '../../errors';
import { isNumber } from '../../utils/utils';
import { WendigoSelector } from '../../types';

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
    let result: CountConfig;
    if (isNumber(count)) {
        result = {
            equal: Number(count)
        };
    } else result = count;
    return result;
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

export function makeAssertion(selector: WendigoSelector, countData: CountConfig, countCase: CountCase, elementsFound: number, msg?: string): Promise<void> {
    switch (countCase) {
        case CountCase.equal:
            return equalAssertion(countData, elementsFound, msg, selector);
        case CountCase.atLeast:
            return atLeastAssertion(countData, elementsFound, msg, selector);
        case CountCase.atMost:
            return atMostAssertion(countData, elementsFound, msg, selector);
        case CountCase.both:
            return bothAssertion(countData, elementsFound, msg, selector);
    }
}

async function equalAssertion(countData: CountConfig, elementsFound: number, msg: string | undefined, selector: WendigoSelector): Promise<void> {
    const expected = Number(countData.equal);
    if (elementsFound !== expected) {
        if (!msg) msg = `Expected selector "${selector}" to find exactly ${countData.equal} elements, ${elementsFound} found`;
        throw new AssertionError("assert.elements", msg, elementsFound, expected);
    }
}

async function atLeastAssertion(countData: CountConfig, elementsFound: number, msg: string | undefined, selector: WendigoSelector): Promise<void> {
    const expected = Number(countData.atLeast);
    if (elementsFound < expected) {
        if (!msg) msg = `Expected selector "${selector}" to find at least ${countData.atLeast} elements, ${elementsFound} found`;
        throw new AssertionError("assert.elements", msg);
    }
}

async function atMostAssertion(countData: CountConfig, elementsFound: number, msg: string | undefined, selector: WendigoSelector): Promise<void> {
    const expected = Number(countData.atMost);
    if (elementsFound > expected) {
        if (!msg) msg = `Expected selector "${selector}" to find up to ${countData.atMost} elements, ${elementsFound} found`;
        throw new AssertionError("assert.elements", msg);
    }
}

async function bothAssertion(countData: CountConfig, elementsFound: number, msg: string | undefined, selector: WendigoSelector): Promise<void> {
    const most = Number(countData.atMost);
    const least = Number(countData.atLeast);
    if (elementsFound < least || elementsFound > most) {
        if (!msg) msg = `Expected selector "${selector}" to find between ${countData.atLeast} and ${countData.atMost} elements, ${elementsFound} found`; // eslint-disable-line max-len
        throw new AssertionError("assert.elements", msg);
    }
}
