/**
 * 定义异常
 */
export declare class RuntimeException {
    _message: string;
    constructor(message: string);
    get name(): string;
    get message(): string;
    toString(): string;
}
export declare class IllegalStateException extends RuntimeException {
    constructor(message: string);
    get name(): string;
}
export declare class InvalidArgumentException extends RuntimeException {
    constructor(message: string);
    get name(): string;
}
export declare class NotImplementedException extends RuntimeException {
    constructor(message: string);
    get name(): string;
}
