import { ConsoleMessageType } from '../../puppeteer_wrapper/puppeteer_types';

export interface ConsoleFilter {
    type?: ConsoleMessageType;
    text?: string | RegExp;
}

export enum LogType {
    log = 'log',
    debug = 'debug',
    info = 'info',
    error = 'error',
    warning = 'warning',
    trace = 'trace'
}
