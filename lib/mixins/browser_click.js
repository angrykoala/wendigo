"use strict";

const {WendigoError, QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserClick extends s {
        click(selector, index) {
            this._failIfNotLoaded("click");
            if (typeof selector === 'number' && typeof index === 'number') {
                return this._clickCoordinates(selector, index);
            }

            return this.queryAll(selector).then((elements) => {
                const indexErrorMsg = `invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
                const notFoundMsg = `No element "${selector}" found.`;
                return this._clickElements(elements, index, new WendigoError("click", indexErrorMsg), new QueryError("click", notFoundMsg));
            });
        }

        clickText(text, optionalText, index) {
            this._failIfNotLoaded("clickText");
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByText(text, optionalText).then((elements) => {
                const indexErrorMsg = `invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
                const notFoundMsg = `No element with text "${optionalText || text}" found.`;
                return this._clickElements(elements, index, new WendigoError("clickText", indexErrorMsg), new QueryError("clickText", notFoundMsg));
            });
        }

        clickTextContaining(text, optionalText, index) {
            this._failIfNotLoaded("clickTextContaining");
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByTextContaining(text, optionalText).then((elements) => {
                const indexErrorMsg = `invalid index "${index}" for text containing "${optionalText || text}", ${elements.length} elements found.`;
                const notFoundMsg = `No element with text containing "${optionalText || text}" found.`;
                return this._clickElements(elements, index, new WendigoError("clickTextContaining", indexErrorMsg), new QueryError("clickTextContaining", notFoundMsg));
            });
        }

        _clickElements(elements, index, indexError, notFoundError) {
            if (index !== undefined) {
                return this._validateAndClickElementByIndex(elements, index, indexError);
            } else {
                return this._validateAndClickElements(elements, notFoundError);
            }
        }

        _validateAndClickElementByIndex(elements, index, error) {
            if (index > elements.length || index < 0 || !elements[index]) {
                return Promise.reject(error);
            }
            return elements[index].click().then(() => {
                return 1;
            });
        }

        async _validateAndClickElements(elements, error) {
            if (elements.length <= 0 || !elements[0]) {
                return Promise.reject(error);
            }
            for (const e of elements) {
                await e.click();
            }
            return elements.length;
        }

        _clickCoordinates(x, y) {
            return this.page.mouse.click(x, y).then(() => {
                return null;
            });
        }
    };
};
