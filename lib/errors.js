"use strict";

const assert = require('assert');

class AssertionError extends assert.AssertionError {
    constructor(fn, message, actual, expected) {
        if (actual !== undefined) actual = String(actual);
        if (expected !== undefined) expected = String(expected);
        const msg = `[${fn}] ${message}`;
        super({
            message: msg,
            actual: actual,
            expected: expected
        });
        this.extraMessage = message;
    }
}

class WendigoError extends Error {
    constructor(fn, message) {
        super(`[${fn}] ${message}`);
        this.fnName = fn;
        this.extraMessage = message;
    }
}

class QueryError extends WendigoError {
    constructor(fn, message) {
        super(fn, message);
        this.name = this.constructor.name;
    }
}

class FatalError extends WendigoError {
    constructor(fn, message) {
        super(fn, message);
        this.name = this.constructor.name;
    }
}

class TimeoutError extends WendigoError {
    constructor(fn, message, timeout) {
        let msg = message ? `${message}, timeout` : "Timeout";
        if (timeout !== undefined) msg = `${msg} of ${timeout}ms exceeded.`;
        super(fn, msg);
        this.name = this.constructor.name;
        this.timeout = timeout;
        this.extraMessage = message;
    }
}


class InjectScriptError extends FatalError {
    constructor(fn, message) {
        message = `${message}. This may be caused by the page Content Security Policy. Make sure the option bypassCSP is set to true in Wendigo.`;
        super(fn, message);
        this.name = this.constructor.name;
    }
}


WendigoError.overrideFnName = function(error, fnName) {
    if (error instanceof TimeoutError) {
        const newError = new error.constructor(fnName, error.extraMessage, error.timeout);
        return newError;
    } else if (error instanceof WendigoError || error instanceof AssertionError) {
        const newError = new error.constructor(fnName, error.extraMessage, error.actual, error.expected); // keeps same error, changes origin function
        return newError;
    } else return error;
};

module.exports = {
    AssertionError: AssertionError,
    QueryError: QueryError,
    FatalError: FatalError,
    TimeoutError: TimeoutError,
    InjectScriptError: InjectScriptError,
    WendigoError: WendigoError
};
