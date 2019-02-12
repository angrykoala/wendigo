"use strict";

const {QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserClick extends s {
        click(selector, index) {
            this._failIfNotLoaded();
            if (typeof selector === 'number' && typeof index === 'number') {
                return this._clickCoordinates(selector, index);
            }

            return this.queryAll(selector).then((elements) => {
                const indexErrorMsg = `browser.click, invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
                const notFoundMsg = `No element "${selector}" found when trying to click.`;
                return this._clickElements(elements, index, indexErrorMsg, notFoundMsg);
            });
        }

        clickText(text, optionalText, index) {
            this._failIfNotLoaded();
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByText(text, optionalText).then((elements) => {
                const indexErrorMsg = `browser.clickText, invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
                const notFoundMsg = `No element with text "${optionalText || text}" found when trying to click.`;
                return this._clickElements(elements, index, indexErrorMsg, notFoundMsg);
            });
        }

        clickTextContaining(text, optionalText, index) {
            this._failIfNotLoaded();
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByTextContaining(text, optionalText).then((elements) => {
                const indexErrorMsg = `browser.clickTextContaining, invalid index "${index}" for text containing "${optionalText || text}", ${elements.length} elements found.`;
                const notFoundMsg = `No element with text containing "${optionalText || text}" found when trying to click.`;
                return this._clickElements(elements, index, indexErrorMsg, notFoundMsg);
            });
        }

        _clickElements(elements, index, indexErrorMsg, notFoundErrorMsg) {
            if (index !== undefined) {
                return this._validateAndClickElementByIndex(elements, index, indexErrorMsg);
            } else {
                return this._validateAndClickElements(elements, notFoundErrorMsg);
            }
        }

        _validateAndClickElementByIndex(elements, index, errorMsg) {
            if (index > elements.length || index < 0 || !elements[index]) {
                const error = new QueryError(errorMsg);
                return Promise.reject(error);
            }
            return elements[index].click().then(() => {
                return 1;
            });
        }


        _validateAndClickElements(elements, errorMsg) {
            if (elements.length <= 0 || !elements[0]) {
                const error = new QueryError(errorMsg);
                return Promise.reject(error);
            }
            return Promise.all(elements.map((e) => e.click())).then(() => {
                return elements.length;
            });
        }

        _clickCoordinates(x, y) {
            return this.elementFromPoint(x, y).then((element) => {
                return this._validateAndClickElements([element], `No element in position [${x}, ${y}] found when trying to click.`);
            });
        }
    };
};
