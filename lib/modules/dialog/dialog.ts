import { Dialog as PuppeteerDialog, DialogType } from '../../browser/puppeteer_wrapper/puppeteer_types';

export default class Dialog {
    private _dialog: PuppeteerDialog;
    constructor(dialog: PuppeteerDialog) {
        this._dialog = dialog;
    }

    public get text(): string {
        return this._dialog.message();
    }

    public get type(): DialogType {
        return this._dialog.type();
    }

    public get handled(): boolean {
        return Boolean((this._dialog as any)._handled);
    }

    public async dismiss(): Promise<void> {
        if (!this.handled)
            return this._dialog.dismiss();
    }

    public async accept(text: string): Promise<void> {
        if (!this.handled)
            return this._dialog.accept(text);
    }
}
