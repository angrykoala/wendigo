"use strict";

const assertUtils = require('../../utils/assert_utils');
/* eslint-disable max-params */
module.exports = function cookies(browser, cookiesModule, name, expected, msg) {
    return cookiesModule.get(name).then((value) => {
        if (expected === undefined) {
            if (value === undefined) {
                if (!msg) {
                    msg = `Expected cookie "${name}" to exist.`;
                }
                return assertUtils.rejectAssertion(msg);
            }
        } else if (value !== expected) {
            if (!msg) {
                msg = `Expected cookie "${name}" to have value "${expected}", "${value}" found.`;
            }
            return assertUtils.rejectAssertion(msg, value, expected);
        }
    });
};
/* eslint-enable max-params */
