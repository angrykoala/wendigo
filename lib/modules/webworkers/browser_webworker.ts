import WebWorker from '../../models/webworker';
import WendigoModule from '../wendigo_module';

export default class BrowserWebWorker extends WendigoModule {
    public all(): Array<WebWorker> {
        return this._browser.page.workers().map((ww) => {
            return new WebWorker(ww);
        });
    }
}
