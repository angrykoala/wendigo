import WebWorker from './webworker';
import WendigoModule from '../wendigo_module';

export default class BrowserWebWorker extends WendigoModule {
    public all(): Array<WebWorker> {
        return this._page.workers().map((ww) => {
            return new WebWorker(ww);
        });
    }
}
