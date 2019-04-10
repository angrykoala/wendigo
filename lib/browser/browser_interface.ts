import Browser from './browser';
import BrowserAssertions from './browser_assertions';

export default interface BrowserInterface extends Browser {
    readonly assert: BrowserAssertions;
}
