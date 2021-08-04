import EventEmitter from 'eventemitter3';
import { MediaSegment, InitSegment } from '../Interfaces/Segment';
import MediaConfig from '../Interfaces/MediaConfig';
interface MSEControllerConfig {
    isLive: boolean;
    autoCleanupSourceBuffer?: boolean;
    autoCleanupMaxBackwardDuration: number;
    autoCleanupMinBackwardDuration: number;
}
interface MSEControllerE {
    onSourceOpen: () => void;
    onSourceEnded: () => void;
    onSourceClose: () => void;
    onSourceBufferError: () => void;
    onSourceBufferUpdateEnd: () => void;
}
declare class MSEController {
    TAG: string;
    private _config;
    private _mediaConfig;
    private _emitter;
    on: <T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any) => EventEmitter<string | symbol, any>;
    off: <T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined) => EventEmitter<string | symbol, any>;
    e: MSEControllerE;
    private _mediaSourceObjectURL;
    private _mediaSource;
    private _mediaElement;
    private _isBufferFull;
    private _hasPendingEos;
    private _requireSetMediaDuration;
    private _pendingMediaDuration;
    private _pendingSourceBufferInit;
    private _mimeTypes;
    private _sourceBuffers;
    private _lastInitSegments;
    private _pendingSegments;
    private _pendingRemoveRanges;
    private _idrList;
    constructor(config: MSEControllerConfig, mediaConfig?: MediaConfig);
    destroy(): void;
    attachMediaElement(mediaElement: HTMLMediaElement): void;
    detachMediaElement(): void;
    appendInitSegment(initSegment: InitSegment, deferred?: boolean): void;
    appendMediaSegment(mediaSegment: MediaSegment): void;
    seek(): void;
    endOfStream(): void;
    getNearestKeyframe(dts: number): import("../Utils/SampleInfo").default | null;
    private _needCleanupSourceBuffer;
    private _doCleanupSourceBuffer;
    private _updateMediaSourceDuration;
    private _doRemoveRanges;
    private _doAppendSegments;
    private _onSourceOpen;
    private _onSourceEnded;
    private _onSourceClose;
    private _hasPendingSegments;
    private _hasPendingRemoveRanges;
    private _onSourceBufferUpdateEnd;
    setMediaSourceDuration(duration: number): void;
}
export default MSEController;
