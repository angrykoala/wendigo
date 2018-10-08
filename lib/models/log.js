"use strict";

const LogType = {
    log: 'log',
    debug: 'debug',
    info: 'info',
    error: 'error',
    warning: 'warning',
    trace: 'trace'
};

module.exports = class Log {
    constructor(consoleMessage) {
        this.message = consoleMessage;
    }

    get text() {
        return this.message.text();
    }

    get type() {
        return this.message.type();
    }

    static get LogType() {
        return LogType;
    }
};
