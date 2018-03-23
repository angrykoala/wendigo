"use strict";

const assert = require('assert');


class QueryError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class EngineError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

module.exports = {
    AssertionError: assert.AssertionError,
    QueryError: QueryError,
    EngineError: EngineError
};
