"use strict";

const BrowserModule = require('./browser_module');
const utils = require('../utils');

const LogType = {
    log: 'log',
    debug: 'debug',
    info: 'info',
    error: 'error',
    warning: 'warning',
    trace: 'trace'
};

class Log {
    constructor(consoleMessage) {
        this.message = consoleMessage;
    }

    get text() {
        return this.message.text();
    }

    get type() {
        return this.message.type();
    }
}

function stringifyArg(arg) {
    return arg.executionContext().evaluate(element => {
        if (typeof element === 'object' && !(element instanceof RegExp)) {
            element = JSON.stringify(element);
        }
        return String(element);
    }, arg);
}

async function stringifyLog(log) {
    if (log.text().includes('JSHandle@object')) {
        const args = await Promise.all(log.args().map(stringifyArg));
        log._text = args.join(' ');
    }

    return log;
}

module.exports = class BrowserConsole extends BrowserModule {
    constructor(browser) {
        super(browser);
        this.clear();
        this._browser.page.on("console", async(log) => {
            const msg = await stringifyLog(log);
            this._logs.push(new Log(msg));
        });
    }

    get LogType() {
        return LogType;
    }

    all() {
        return this._logs;
    }

    filter(filters = {}) {
        return this._logs.filter((l) => {
            if (filters.type && l.type !== filters.type) return false;
            if (filters.text && !utils.matchText(l.text, filters.text)) return false;
            return true;
        });
    }

    clear() {
        this._logs = [];
    }

    _beforeClose() {
        this.clear();
    }
};
