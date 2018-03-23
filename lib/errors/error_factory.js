"use strict";

const Errors = require('./errors');

module.exports = class ErrorFactory {

    static generateAssertionError(msg) {
        return new Errors.AssertionError({message: msg});
    }

    static generateQueryError(msg) {
        return new Errors.QueryError(msg);
    }
};
