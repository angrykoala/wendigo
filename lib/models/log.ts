import { ConsoleMessage, ConsoleMessageType } from 'puppeteer';

enum LogType {
    log = 'log',
    debug = 'debug',
    info = 'info',
    error = 'error',
    warning = 'warning',
    trace = 'trace'
}

export default class Log {
    public message: ConsoleMessage;
    constructor(consoleMessage: ConsoleMessage) {
        this.message = consoleMessage;
    }

    get text() {
        return this.message.text();
    }

    get type(): ConsoleMessageType {
        return this.message.type();
    }

    static get LogType(): typeof LogType {
        return LogType;
    }
}
