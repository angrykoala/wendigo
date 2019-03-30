import { Dialog as PuppeteerDialog, DialogType } from 'puppeteer';

export default class Dialog {
    private dialog: PuppeteerDialog;
    constructor(dialog: PuppeteerDialog) {
        this.dialog = dialog;
    }

    get text(): string {
        return this.dialog.message();
    }

    get type(): DialogType {
        return this.dialog.type();
    }

    public dismiss(): Promise<void> {
        // if (!this.dialog._handled)
        return this.dialog.dismiss();
    }

    public accept(text: string): Promise<void> {
        // if (!this.dialog._handled)
        return this.dialog.accept(text);
    }
}
