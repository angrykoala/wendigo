"use strict";

const assertUtils = require('../../utils/assert_utils');
/* eslint-disable max-params */
module.exports = {
    assert(browser, cookiesModule, name, expected, msg) {
        return cookiesModule.get(name).then((value) => {
            if (expected === undefined) {
                if (value === undefined) {
                    if (!msg) {
                        msg = `Expected cookie "${name}" to exist.`;
                    }
                    return assertUtils.rejectAssertion("assert.cookies", msg);
                }
            } else if (value !== expected) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
                }
                return assertUtils.rejectAssertion("assert.cookies", msg, value, expected);
            }
        });
    },
    not(browser, cookiesModule, name, expected, msg) {
        if (!msg) {
            msg = expected === undefined ?
                `Expected cookie "${name}" to not exist.` :
                `Expected cookie "${name}" to not have value "${expected}".`;
        }
        return assertUtils.invertify(() => {
            return browser.assert.cookies(name, expected, "x");
        }, "assert.not.cookies", msg);
    }
};
/* eslint-enable max-params */
