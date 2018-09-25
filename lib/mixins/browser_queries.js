"use strict";

const DomElement = require('../models/dom_element');
const {FatalError} = require('../errors');

module.exports = function BrowserQueriesMixin(s) {
    return class BrowserQueries extends s {
        query(selector, optionalSelector) {
            this._failIfNotLoaded();
            if (optionalSelector) {
                return this._subQuery(selector, optionalSelector);
            }
            if (typeof selector === 'string') {
                return this.page.$(selector).then((elementHandle) => {
                    return DomElement._processQueryResult(elementHandle, selector);
                });
            } else if (selector instanceof DomElement) return Promise.resolve(selector);
            else return Promise.reject(new FatalError("Invalid Selector on browser.query."));
        }

        queryAll(selector, optionalSelector) {
            this._failIfNotLoaded();
            if (optionalSelector) {
                return this._subQueryAll(selector, optionalSelector);
            }
            if (typeof selector === 'string') {
                return this.page.$$(selector).then((elements) => {
                    return elements.map((e) => {
                        return DomElement._processQueryResult(e, selector);
                    });
                });
            } else if (!Array.isArray(selector)) { // TODO: throw error if selector is nor domelement
                return Promise.resolve([selector]);
            } else return Promise.resolve(selector);
        }

        queryXPath(xPath) {
            this._failIfNotLoaded();
            return this.page.$x(xPath).then((elements) => {
                return elements.map((e) => {
                    return DomElement._processQueryResult(e, xPath);
                });
            });
        }

        findByText(text, optionalText) {
            this._failIfNotLoaded();
            const xPathText = optionalText || text;
            const xPath = `//*[text()='${xPathText}']`;
            if (optionalText) {
                return this.query(text).then((elem) => {
                    return this._subQueryXpath(elem, xPath);
                });
            } else {
                return this.queryXPath(xPath);
            }
        }

        findByTextContaining(text, optionalText) {
            this._failIfNotLoaded();
            const xPathText = optionalText || text;
            const xPath = `//*[contains(text(),'${xPathText}')]`;
            if (optionalText) {
                return this.query(text).then((elem) => {
                    return this._subQueryXpath(elem, xPath);
                });
            } else {
                return this.queryXPath(xPath);
            }
        }

        _subQueryXpath(parent, selector) {
            if (selector[0] === "/") selector = `.${ selector}`;
            if (!(parent instanceof DomElement)) return Promise.reject(new Error("Invalid parent element for query"));
            return parent.queryXPath(selector);
        }

        _subQuery(parent, selector) {
            if (!(parent instanceof DomElement)) return Promise.reject(new Error("Invalid parent element for query"));
            return parent.query(selector);
        }

        _subQueryAll(parent, selector) {
            if (!(parent instanceof DomElement)) return Promise.reject(new Error("Invalid parent element for queryAll"));
            return parent.queryAll(selector);
        }
    };
};
