"use strict";

const Errors = require('./errors');

module.exports = class ErrorFactory {

    static generateAssertionError(msg, actual, expected) {
        if(actual !== undefined) actual = String(actual);
        if(expected !== undefined) expected = String(expected);
        return new Errors.AssertionError({
            message: msg,
            actual: actual,
            expected: expected
        });
    }

    static generateQueryError(msg) {
        return new Errors.QueryError(msg);
    }

    static generateFatalError(msg) {
        return new Errors.FatalError(msg);
    }
};
