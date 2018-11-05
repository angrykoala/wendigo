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

class AssertionError extends assert.AssertionError {
    constructor(msg, actual, expected) {
        if (actual !== undefined) actual = String(actual);
        if (expected !== undefined) expected = String(expected);
        super({
            message: msg,
            actual: actual,
            expected: expected
        });
    }
}

class InjectScriptError extends FatalError {
    constructor(message) {
        message = `${message}. This may be caused by the page Content Security Policy. Make sure the option bypassCSP is set to true in Wendigo.`;
        super(message);
        this.name = this.constructor.name;
    }
}

module.exports = {
    AssertionError: AssertionError,
    QueryError: QueryError,
    FatalError: FatalError,
    TimeoutError: TimeoutError,
    InjectScriptError: InjectScriptError
};
