"use strict";

module.exports = function BrowserNavigationMixin(s) {
    return class BrowserNavigation extends s {
        back() {
            this._failIfNotLoaded();
            return this.page.goBack().then(() => {
                return this._afterPageLoad();
            });
        }

        forward() {
            this._failIfNotLoaded();
            return this.page.goForward().then(() => {
                return this._afterPageLoad();
            });
        }

        refresh() {
            this._failIfNotLoaded();
            return this.page.reload().then(() => {
                return this._afterPageLoad();
            });
        }
    };
};
