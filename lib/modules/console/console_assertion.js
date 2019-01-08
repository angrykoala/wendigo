"use strict";

const assertUtils = require('../../utils/assert_utils');


function processMessage(filterOptions, count, actualCount) {
    const checkCount = count !== undefined && count !== null;
    const typeMsg = filterOptions.type ? ` of type "${filterOptions.type}"` : "";
    const textMsg = filterOptions.text ? ` with text "${filterOptions.text}"` : "";
    const countMsg = checkCount ? ` ${count}` : "";
    return `Expected${countMsg} console events${typeMsg}${textMsg}, ${actualCount} found.`;
}

/* eslint-disable complexity, max-params*/
module.exports = function(browser, consoleModule, filterOptions, count, msg) {
    const logs = consoleModule.filter(filterOptions);
    const checkCount = count !== undefined && count !== null;
    if ((checkCount && logs.length !== count) || (!checkCount && logs.length === 0)) {
        if (!msg) {
            msg = processMessage(filterOptions, count, logs.length);
        }
        return assertUtils.rejectAssertion(msg);
    }
};
/* eslint-enable complexity, max-params*/
