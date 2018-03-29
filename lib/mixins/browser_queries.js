"use strict";

module.exports = function BrowserQueriesMixin(s) {
    return class BrowserQueries extends s {

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

        findByText(text, optionalText) {
            this._failIfNotLoaded();
            const xPathText = optionalText || text;
            const xPath = `//*[text()='${xPathText}']`;
            if(optionalText) {
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
            if(optionalText) {
                return this.query(text).then((elem) => {
                    return this._subQueryXpath(elem, xPath);
                });
            } else {
                return this.queryXPath(xPath);
            }
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
    };
};
