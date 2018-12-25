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
                if (index !== undefined) {
                    if (index > elements.length || index < 0) {
                        const errorMsg = `browser.click, invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
                        const error = new QueryError(errorMsg);
                        return Promise.reject(error);
                    }
                    elements[index].click();
                    return 1;
                } else {
                    if (elements.length <= 0) {
                        const error = new QueryError(`No element "${selector}" found when trying to click.`);
                        return Promise.reject(error);
                    }
                    return Promise.all(elements.map((e) => e.click())).then(() => {
                        return elements.length;
                    });
                }
            });
        }

        clickText(text, optionalText, index) { //TODO: refactor with clickTextContaining
            this._failIfNotLoaded();
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByText(text, optionalText).then((elements) => {
                if (elements.length <= 0) {
                    const error = new QueryError(`No element with text "${optionalText || text}" found when trying to click.`);
                    return Promise.reject(error);
                }
                if (index !== undefined) {
                    if (index > elements.length || index < 0) {
                        const errorMsg = `browser.click, invalid index "${index}" for text "${optionalText || text}", ${elements.length} elements found.`;
                        const error = new QueryError(errorMsg);
                        return Promise.reject(error);
                    }
                    return this.click(elements[index]);
                } else return this.click(elements);
            });
        }

        clickTextContaining(text, optionalText, index) {
            this._failIfNotLoaded();
            if (typeof optionalText === 'number' && index === undefined) {
                index = optionalText;
                optionalText = undefined;
            }
            return this.findByTextContaining(text, optionalText).then((elements) => {
                if (elements.length <= 0) {
                    const error = new QueryError(`No element with text containing "${optionalText || text}" found when trying to click.`);
                    return Promise.reject(error);
                }
                if (index !== undefined) {
                    if (index > elements.length || index < 0) {
                        const errorMsg = `browser.clickTextContaining, invalid index "${index}" for text containing "${optionalText || text}", ${elements.length} elements found.`;
                        const error = new QueryError(errorMsg);
                        return Promise.reject(error);
                    }
                    return this.click(elements[index]);
                } else return this.click(elements);
            });
        }

        _clickCoordinates(x, y) {
            return this.evaluate((evalX, evalY) => {
                const elem = document.elementFromPoint(evalX, evalY);
                if (!elem) return 0;
                else {
                    elem.click();
                    return 1;
                }
            }, x, y).then((elements) => {
                if (elements === 0) {
                    const error = new QueryError(`No element in position [${x}, ${y}] found when trying to click.`);
                    return Promise.reject(error);
                } else return elements;
            });
        }
    };
};
