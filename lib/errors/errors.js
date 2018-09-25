"use strict";

const assert = require('assert');

class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class FatalError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class TimeoutError extends Error {
    constructor(message, timeout) {
        if (timeout !== undefined) message = `${message}, timeout of ${timeout}ms exceeded.`;
        super(message);
        this.name = this.constructor.name;
    }
}

module.exports = {
    AssertionError: assert.AssertionError,
    QueryError: QueryError,
    FatalError: FatalError,
    TimeoutError: TimeoutError
};
