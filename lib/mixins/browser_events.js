/* global WendigoUtils */
"use strict";

// const {WendigoError, QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserEvents extends s {
        triggerEvent(selector, eventName, options) {
            this._failIfNotLoaded("triggerEvent");
            return this.evaluate((q, evName, opt) => {
                const ev = new Event(evName, opt);
                const elements = WendigoUtils.queryAll(q);
                for (const e of elements) {
                    e.dispatchEvent(ev);
                }
            }, selector, eventName, options);
        }
    };
};
