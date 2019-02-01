"use strict";

const Dialog = require('../../models/dialog');
const {TimeoutError} = require('../../errors');

const defaultOptions = {
    dismissAllDialogs: false
};

module.exports = class BrowserDialog {
    constructor(browser) {
        this.clear();
        this._onDialog = null;
        this._options = Object.assign({}, defaultOptions);
        browser.page.on("dialog", (rawDialog) => {
            const newDialog = new Dialog(rawDialog);
            this._dialogs.push(newDialog);
            if (this._onDialog) {
                this._onDialog(newDialog);
                this._onDialog = null;
                this._lastDialog = null;
            } else {
                this._lastDialog = newDialog;
            }
            if (this._options.dismissAllDialogs) newDialog.dismiss();
        });
    }

    all() {
        return this._dialogs;
    }

    clear() {
        this._dialogs = [];
        this._lastDialog = null;
    }

    waitForDialog(timeout = 500) {
        if (this._lastDialog) {
            const result = Promise.resolve(this._lastDialog);
            this._lastDialog = null;
            return result;
        } else {
            return new Promise((resolve, reject) => { // TODO: cleanup
                const tid = setTimeout(() => {
                    if (this._onDialog) {
                        this._onDialog = null;
                        reject(new TimeoutError(`Wait for dialog`, timeout));
                    }
                }, timeout);
                this._onDialog = (dialog) => {
                    clearTimeout(tid);
                    resolve(dialog);
                };
            });
        }
    }

    dismissLast() {
        if (this._dialogs.length === 0) return Promise.resolve();
        return this._dialogs[this._dialogs.length - 1].dismiss();
    }

    _beforeOpen(options) {
        this.clear();
        if (options.dismissAllDialogs) this._options.dismissAllDialogs = true;
    }
};
