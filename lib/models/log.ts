import { ConsoleMessage, ConsoleMessageType } from 'puppeteer';
import { stringifyLogText } from '../utils/utils';

export default class Log {
    public message: ConsoleMessage;
    public readonly text: string;
    constructor(consoleMessage: ConsoleMessage) {
        this.message = consoleMessage;
        this.text = stringifyLogText(consoleMessage);
    }

    get type(): ConsoleMessageType {
        return this.message.type();
    }
}
