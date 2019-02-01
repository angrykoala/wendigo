"use strict";


module.exports = class Dialog {
    constructor(dialog) {
        this._dialog = dialog;
    }

    get text() {
        return this._dialog.message();
    }

    get type() {
        return this._dialog.type();
    }

    dismiss() {
        if (!this._dialog._handled)
            return this._dialog.dismiss();
    }

    accept(text) {
        if (!this._dialog._handled)
            return this._dialog.accept(text);
    }
};
