import { WendigoError } from '../models/errors';
import { DecoratorFunction } from './types';

export default function OverrideError(errorPrefix?: string): DecoratorFunction {
    return function(_target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor): void {
        const originalMethod = propertyDescriptor.value;
        propertyDescriptor.value = async function(...args: Array<any>): Promise<any> {
            const originalThis = this as any;
            try {
                return await originalMethod.bind(originalThis)(...args);
            } catch (err) {
                const fullMethodName = `${errorPrefix ? errorPrefix + "." : ""}${propertyKey}`;
                throw WendigoError.overrideFnName(err, fullMethodName);
            }
        };
    };
}
