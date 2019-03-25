/* global WendigoUtils */
"use strict";

const DomElement = require('../models/dom_element');
const {FatalError, WendigoError} = require('../errors');

module.exports = function BrowserQueriesMixin(s) {
    return class BrowserQueries extends s {
        query(selector, optionalSelector) {
            this._failIfNotLoaded("query");
            if (optionalSelector) {
                return this._subQuery("query", selector, optionalSelector);
            }
            if (typeof selector === 'string') {
                return this.page.$(selector).then((elementHandle) => {
                    return DomElement.processQueryResult(elementHandle, selector);
                });
            } else if (selector instanceof DomElement) return Promise.resolve(selector);
            else return Promise.reject(new FatalError("query", "Invalid Selector on browser.query."));
        }

        queryAll(selector, optionalSelector) {
            this._failIfNotLoaded("queryAll");
            if (optionalSelector) {
                return this._subQueryAll("queryAll", selector, optionalSelector);
            }
            if (typeof selector === 'string') {
                return this.page.$$(selector).then((elements) => {
                    return elements.map((e) => {
                        return DomElement.processQueryResult(e, selector);
                    });
                });
            } else if (!Array.isArray(selector)) { // TODO: throw error if selector is nor domelement
                return Promise.resolve([selector]);
            } else return Promise.resolve(selector);
        }

        queryXPath(xPath) {
            this._failIfNotLoaded("queryXPath");
            return this.page.$x(xPath).then((elements) => {
                return elements.map((e) => {
                    return DomElement.processQueryResult(e, xPath);
                });
            });
        }

        findByText(text, optionalText) {
            this._failIfNotLoaded("findByText");
            const xPathText = optionalText || text;
            const xPath = `//*[text()='${xPathText}']`;
            if (optionalText) {
                return this.query(text).then((elem) => {
                    return this._subQueryXpath("findByText", elem, xPath);
                });
            } else {
                return this.queryXPath(xPath);
            }
        }

        findByTextContaining(text, optionalText) {
            this._failIfNotLoaded("findByTextContaining");
            const xPathText = optionalText || text;
            const xPath = `//*[contains(text(),'${xPathText}')]`;
            if (optionalText) {
                return this.query(text).then((elem) => {
                    return this._subQueryXpath("findByTextContaining", elem, xPath);
                });
            } else {
                return this.queryXPath(xPath);
            }
        }

        findByAttribute(attributeName, attributeValue) {
            this._failIfNotLoaded("findByAttribute");
            if (attributeValue === undefined) {
                attributeValue = "";
            } else {
                attributeValue = `='${attributeValue}'`;
            }
            return this.queryAll(`[${attributeName}${attributeValue}]`);
        }

        findCssPath(domElement) {
            this._failIfNotLoaded("findCssPath");
            if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findCssPath", "Invalid element for css path query."));
            else return this.evaluate((e) => {
                return WendigoUtils.findCssPath(e);
            }, domElement);
        }

        findXPath(domElement) {
            this._failIfNotLoaded("findXPath");
            if (!(domElement instanceof DomElement)) return Promise.reject(new WendigoError("findXPath", "Invalid element for xPath query."));
            else return this.evaluate((e) => {
                return WendigoUtils.findXPath(e);
            }, domElement);
        }

        elementFromPoint(x, y) {
            this._failIfNotLoaded("elementFromPoint");
            if (typeof x !== 'number' || typeof y !== 'number') return Promise.reject(new FatalError("elementFromPoint", `Invalid coordinates [${x},${y}].`));
            return this.page.evaluateHandle((evalX, evalY) => {
                const element = document.elementFromPoint(evalX, evalY);
                return element || undefined;
            }, x, y).then((elementHandle) => {
                if (elementHandle._remoteObject.type === 'undefined') return undefined;
                else return DomElement.processQueryResult(elementHandle);
            });
        }

        _subQueryXpath(fnName, parent, selector) {
            if (selector[0] === "/") selector = `.${ selector}`;
            if (!(parent instanceof DomElement)) return Promise.reject(new WendigoError(fnName, "Invalid parent element for query"));
            return parent.queryXPath(selector);
        }

        _subQuery(fnName, parent, selector) {
            if (!(parent instanceof DomElement)) return Promise.reject(new WendigoError(fnName, "Invalid parent element for query"));
            return parent.query(selector);
        }

        _subQueryAll(fnName, parent, selector) {
            if (!(parent instanceof DomElement)) return Promise.reject(new WendigoError(fnName, "Invalid parent element for queryAll"));
            return parent.queryAll(selector);
        }
    };
};
