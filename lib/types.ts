import DomElement from './models/dom_element';
import { Viewport } from 'puppeteer';

export type CssSelector = string;
export type XPathSelector = string;

export type WendigoSelector = CssSelector | XPathSelector | DomElement;

export interface ParsedQueryString { [s: string]: string; }

export interface BrowserSettings {
    log: boolean;
    userAgent: string;
    bypassCSP: boolean;
}

export type WendigoPluginInterface = any;

export interface OpenSettings {
    clearRequestMocks?: boolean;
    viewport?: Viewport;
    queryString?: string | ParsedQueryString;
}
