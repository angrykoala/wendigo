import Dialog from './dialog';
import { TimeoutError } from '../../errors';

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
    private dialogs: Array<Dialog>;
    private options: DialogOptions;
    private onDialogCB?: (d: Dialog) => void;
    private lastDialog?: Dialog;

    constructor(browser: Browser) {
        super(browser);
        this.dialogs = [];
        this.options = Object.assign({}, defaultOptions);

        browser.page.on("dialog", (rawDialog) => {
            const newDialog = new Dialog(rawDialog);
            this.dialogs.push(newDialog);
            if (this.onDialogCB) {
                this.onDialogCB(newDialog);
                this.onDialogCB = undefined;
                this.lastDialog = undefined;
            } else {
                this.lastDialog = newDialog;
            }
            if (this.options.dismissAllDialogs) newDialog.dismiss();
        });
    }

    public all(): Array<Dialog> {
        return this.dialogs;
    }

    public clear(): void {
        this.dialogs = [];
        this.lastDialog = undefined;
    }

    public waitForDialog(timeout = 500): Promise<Dialog> {
        if (this.lastDialog) {
            const result = Promise.resolve(this.lastDialog);
            this.lastDialog = undefined;
            return result;
        } else {
            return new Promise((resolve, reject) => {
                const tid = setTimeout(() => {
                    if (this.onDialogCB) {
                        this.onDialogCB = undefined;
                        reject(new TimeoutError("dialog.waitForDialog", "", timeout));
                    }
                }, timeout);
                this.onDialogCB = (dialog) => {
                    clearTimeout(tid);
                    resolve(dialog);
                };
            });
        }
    }

    public dismissLast(): Promise<void> {
        if (this.dialogs.length === 0) return Promise.resolve();
        return this.dialogs[this.dialogs.length - 1].dismiss();
    }

    protected async _beforeOpen(options: OpenSettings): Promise<void> {
        await super._beforeOpen(options);
        this.clear();
        this.options = Object.assign({}, defaultOptions);
        if ((options as any).dismissAllDialogs) this.options.dismissAllDialogs = true;
    }
}
