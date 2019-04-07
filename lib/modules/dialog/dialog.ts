import { Dialog as PuppeteerDialog, DialogType } from 'puppeteer';

export default class Dialog {
    private dialog: PuppeteerDialog;
    constructor(dialog: PuppeteerDialog) {
        this.dialog = dialog;
    }

    public get text(): string {
        return this.dialog.message();
    }

    public get type(): DialogType {
        return this.dialog.type();
    }

    public get handled(): boolean {
        return Boolean((this.dialog as any)._handled);
    }

    public async dismiss(): Promise<void> {
        if (!this.handled)
            return this.dialog.dismiss();
    }

    public async accept(text: string): Promise<void> {
        if (!this.handled)
            return this.dialog.accept(text);
    }
}
