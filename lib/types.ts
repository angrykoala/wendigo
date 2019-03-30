import DomElement from './models/dom_element';
import { ParsedUrlQuery } from 'querystring';

export type CssSelector = string;
export type XPathSelector = string;

export type WendigoSelector = CssSelector | XPathSelector | DomElement;

export type ParsedQueryString = ParsedUrlQuery | { [s: string]: string };

export type Constructor<T> = new(...args: any[]) => T;
