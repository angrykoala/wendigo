import Dialog from './dialog';
import { TimeoutError } from '../../models/errors';

import WendigoModule from '../wendigo_module';
import { OpenSettings } from '../../types';
import Browser from '../../browser/browser';

interface DialogOptions {
    dismissAllDialogs: boolean;
}

const defaultOptions: DialogOptions = {
    dismissAllDialogs: false
};

export default class BrowserDialog extends WendigoModule {
    private _dialogs: Array<Dialog>;
    private _options: DialogOptions;
    private _onDialogCB?: (d: Dialog) => void;
    private _lastDialog?: Dialog;

    constructor(browser: Browser) {
        super(browser);
        this._dialogs = [];
        this._options = Object.assign({}, defaultOptions);

        browser.page.on("dialog", (rawDialog) => {
            const newDialog = new Dialog(rawDialog);
            this._dialogs.push(newDialog);
            if (this._onDialogCB) {
                this._onDialogCB(newDialog);
                this._onDialogCB = undefined;
                this._lastDialog = undefined;
            } else {
                this._lastDialog = newDialog;
            }
            if (this._options.dismissAllDialogs) newDialog.dismiss();
        });
    }

    public all(): Array<Dialog> {
        return this._dialogs;
    }

    public clear(): void {
        this._dialogs = [];
        this._lastDialog = undefined;
    }

    public waitForDialog(timeout = 500): Promise<Dialog> {
        if (this._lastDialog) {
            const result = Promise.resolve(this._lastDialog);
            this._lastDialog = undefined;
            return result;
        } else {
            return new Promise((resolve, reject) => {
                const tid = setTimeout(() => {
                    if (this._onDialogCB) {
                        this._onDialogCB = undefined;
                        reject(new TimeoutError("dialog.waitForDialog", "", timeout));
                    }
                }, timeout);
                this._onDialogCB = (dialog) => {
                    clearTimeout(tid);
                    resolve(dialog);
                };
            });
        }
    }

    public dismissLast(): Promise<void> {
        if (this._dialogs.length === 0) return Promise.resolve();
        return this._dialogs[this._dialogs.length - 1].dismiss();
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        await super._beforeOpen(options);
        this.clear();
        this._options = Object.assign({}, defaultOptions);
        if ((options as any).dismissAllDialogs) this._options.dismissAllDialogs = true;
    }
}
