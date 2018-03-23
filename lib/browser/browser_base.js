/* global WendigoUtils */
"use strict";

const ErrorFactory = require('../errors/error_factory');

function pageLog(log) {
    console[log._type](log._text); // eslint-disable-line
}

module.exports = class BrowserBase {
    constructor(page, settings) {
        this.page = page;
        this._loaded = false;
        if(settings.log) {
            this.page.on("console", pageLog);
        }
    }

    evaluate(cb, ...args) {
        this._failIfNotLoaded();
        return this.page.evaluate(cb, ...args);
    }

    query(selector, optionalSelector) {
        this._failIfNotLoaded();
        if(optionalSelector) {
            return this._subQuery(selector, optionalSelector);
        }
        if(typeof selector === 'string') {
            return this.page.$(selector);
        } else return Promise.resolve(selector);
    }

    queryAll(selector, optionalSelector) {
        this._failIfNotLoaded();
        if(optionalSelector) {
            return this._subQueryAll(selector, optionalSelector);
        }
        if(typeof selector === 'string') {
            return this.page.$$(selector);
        } else if(!Array.isArray(selector)) {
            return Promise.resolve([selector]);
        } else return Promise.resolve(selector);
    }

    queryXPath(xPath) {
        this._failIfNotLoaded();
        return this.page.$x(xPath);
    }

    class(selector) {
        this._failIfNotLoaded();
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) throw new Error();
            else return Array.from(element.classList);
        }, selector).catch(() => {
            const error = ErrorFactory.generateQueryError(`Selector "${selector}" doesn't match any elements when trying to get classes.`);
            return Promise.reject(error);
        });
    }

    value(selector) {
        this._failIfNotLoaded();
        return this.evaluate((q) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) return null;
            else if(element.value === undefined) return null;
            else return element.value;
        }, selector);
    }

    attribute(selector, attributeName) {
        this._failIfNotLoaded();
        return this.evaluate((q, attributeName) => {
            const element = WendigoUtils.queryElement(q);
            if(!element) return Promise.reject();
            return element.getAttribute(attributeName);
        }, selector, attributeName).catch(() => { // To avoid Error: Evaluation Failed
            const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get attribute "${attributeName}".`);
            return Promise.reject(error);
        });
    }

    styles(selector) {
        this._failIfNotLoaded();
        return this.evaluate((selector) => {
            const element = WendigoUtils.queryElement(selector);
            if(!element) return Promise.reject();
            return WendigoUtils.getStyles(element);
        }, selector).catch(() => { // To avoid Error: Evaluation Failed
            const error = ErrorFactory.generateQueryError(`Element "${selector}" not found when trying to get styles.`);
            return Promise.reject(error);
        });
    }

    _subQueryXpath(parent, selector) {
        if(selector[1] === "/") selector = selector.slice(1);
        if(selector[0] === "/")selector = `.${ selector}`;
        if(!parent || !parent.$) return Promise.reject(new Error("Invalid parent element for query"));
        return parent.$x(selector);
    }

    _subQuery(parent, selector) {
        if(!parent || !parent.$) return Promise.reject(new Error("Invalid parent element for query"));
        return parent.$(selector);
    }

    _subQueryAll(parent, selector) {
        if(!parent || !parent.$) return Promise.reject(new Error("Invalid parent element for queryAll"));
        return parent.$$(selector);
    }

    _failIfNotLoaded() {
        if(!this._loaded) {
            throw ErrorFactory.generateFatalError(`Cannot perform action before opening a page.`);
        }
    }
};
