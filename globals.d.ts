// declare var WendigoUtils: any;
declare namespace WendigoUtils {
    function isVisible(element: any): boolean;
    function queryElement(selector: any): any;
    function queryAll(selector: any): any;
    function xPathQuery(xPath: string): any;
    function getStyles(element: any): any;
    function mockDate(timestamp: number, freeze: boolean): void;
    function clearDateMock(): void;
    function findCssPath(...args: Array<any>): string;
    function findXPath(...args: Array<any>): string;
}
