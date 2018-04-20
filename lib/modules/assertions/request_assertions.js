"use strict";

const RequestAssertionsFilter = require('./request_assertions_filter');


module.exports = class RequestAssertions extends RequestAssertionsFilter {
    constructor(browserAssertions) {
        super(browserAssertions._browser.requests.filter);
    }
};
