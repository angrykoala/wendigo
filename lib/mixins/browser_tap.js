"use strict";

const {WendigoError, QueryError} = require('../errors');

module.exports = function BrowserActionsMixin(s) {
    return class BrowserClick extends s {
        tap(selector, index) {
            this._failIfNotLoaded("tap");
            if (typeof selector === 'number' && typeof index === 'number') {
                return this._tapCoordinates(selector, index);
            }

            return this.queryAll(selector).then((elements) => {
                const indexErrorMsg = `invalid index "${index}" for selector "${selector}", ${elements.length} elements found.`;
                const notFoundMsg = `No element "${selector}" found.`;
                return this._tapElements(elements, index, new WendigoError("tap", indexErrorMsg), new QueryError("tap", notFoundMsg));
            });
        }

        _tapElements(elements, index, indexError, notFoundError) {
            if (index !== undefined) {
                return this._validateAndTapElementByIndex(elements, index, indexError);
            } else {
                return this._validateAndTapElements(elements, notFoundError);
            }
        }

        _validateAndTapElementByIndex(elements, index, error) {
            if (index > elements.length || index < 0 || !elements[index]) {
                return Promise.reject(error);
            }
            return elements[index].tap().then(() => {
                return 1;
            });
        }


        async _validateAndTapElements(elements, error) {
            if (elements.length <= 0 || !elements[0]) {
                return Promise.reject(error);
            }
            for (const e of elements) {
                await e.tap();
            }
            return elements.length;
        }

        _tapCoordinates(x, y) {
            return this.page.touchscreen.tap(x, y).then(() => {
                return null;
            });
        }
    };
};
