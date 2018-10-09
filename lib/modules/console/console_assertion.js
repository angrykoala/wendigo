"use strict";

const assertUtils = require('../../utils/assert_utils');

/* eslint-disable complexity, max-params*/
module.exports = function(browser, consoleModule, options, count, msg) {
    const logs = consoleModule.filter(options);
    const checkCount = count !== undefined && count !== null;
    if ((checkCount && logs.length !== count) || (!checkCount && logs.length === 0)) {
        if (!msg) {
            const typeMsg = options.type ? ` of type "${options.type}"` : "";
            const textMsg = options.text ? ` with text "${options.text}"` : "";
            const countMsg = checkCount ? ` ${count}` : "";
            msg = `Expected${countMsg} console events${typeMsg}${textMsg}, ${logs.length} found.`;
        }
        return assertUtils.rejectAssertion(msg);
    }
};
/* eslint-enable complexity, max-params*/
