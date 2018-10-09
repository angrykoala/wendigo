"use strict";

const utils = require('../../utils');
const Log = require('../../models/log');

module.exports = class BrowserConsole {
    constructor(browser) {
        this._browser = browser;
        this.clear();
        this._browser.page.on("console", (log) => {
            utils.stringifyLogText(log).then(text => {
                log._text = text;
                this._logs.push(new Log(log));
            });
        });
    }

    get LogType() {
        return Log.LogType;
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

    _beforeOpen() {
        this.clear();
    }
};
