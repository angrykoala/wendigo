"use strict";
const assertUtils = require('../../utils/assert_utils');

/* eslint-disable complexity */
module.exports = function(browser, webworkerModule, options, msg) {
    if (!options) options = {};
    let workers = webworkerModule.all();
    let urlMsg = "";
    if (options.url) {
        urlMsg = ` with url "${options.url}"`;
        workers = workers.filter((w) => {
            return w.url === options.url;
        });
    }
    if (options.count !== undefined) {
        if (workers.length !== options.count) {
            if (!msg) msg = `Expected ${options.count} webworkers running${urlMsg}, ${workers.length} found.`;
            return assertUtils.rejectAssertion(msg);
        }
    } else if (workers.length === 0) {
        if (!msg) msg = `Expected at least 1 webworker running${urlMsg}, 0 found.`;
        return assertUtils.rejectAssertion(msg);
    }
};
/* eslint-enable complexity */
