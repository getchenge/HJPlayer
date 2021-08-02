import EventEmitter from 'eventemitter3';
import UserConfig from '../Interfaces/UserConfig';
declare class LoggingControl {
    static emitter: EventEmitter;
    static get forceGlobalTag(): boolean;
    static set forceGlobalTag(enable: boolean);
    static get globalTag(): string;
    static set globalTag(tag: string);
    static get enableAll(): boolean | undefined;
    static set enableAll(enable: boolean | undefined);
    static get enableDebug(): boolean | undefined;
    static set enableDebug(enable: boolean | undefined);
    static get enableInfo(): boolean | undefined;
    static set enableInfo(enable: boolean | undefined);
    static get enableWarn(): boolean | undefined;
    static set enableWarn(enable: boolean | undefined);
    static get enableError(): boolean | undefined;
    static set enableError(enable: boolean | undefined);
    static getConfig(): {
        globalTag: string;
        forceGlobalTag: boolean | undefined;
        enableDebug: boolean | undefined;
        enableInfo: boolean | undefined;
        enableWarn: boolean | undefined;
        enableError: boolean | undefined;
        enableCallback: boolean | undefined;
    };
    static applyConfig(config: UserConfig): void;
    static _notifyChange(): void;
    static registerListener(listener: EventEmitter.ListenerFn): void;
    static removeListener(listener: EventEmitter.ListenerFn): void;
    static addLogListener(listener: EventEmitter.ListenerFn): void;
    static removeLogListener(listener: EventEmitter.ListenerFn): void;
}
export default LoggingControl;
