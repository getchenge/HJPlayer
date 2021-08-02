import Level from '../Parser/Level';
import Attr from '../Utils/attr-list';
import Fragment from '../Loaders/Fragment';

export interface LoaderContext {
    // target URL
    url: string
    // loader response type (arraybuffer or default response type for playlist)
    responseType: XMLHttpRequestResponseType
    // start byte range offset
    rangeStart?: number
    // end byte range offset
    rangeEnd?: number
    // true if onProgress should report partial chunk of loaded content
    progressData?: boolean
}
export interface FragLoaderContext extends LoaderContext {
    frag?: Fragment
    type?: string
    level?: number
    id?: number | null
}
export interface level {
    bitrate: number
    width: number
    height: number
    name: string
    url: string
    videoCodec: string
}

export interface LoaderConfiguration {
    // Max number of load retries
    maxRetry: number
    // Timeout after which `onTimeOut` callback will be triggered
    // (if loading is still not finished after that delay)
    timeout: number
    // Delay between an I/O error and following connection retry (ms).
    // This to avoid spamming the server
    retryDelay: number
    // max connection retry delay (ms)
    maxRetryDelay: number
}

export interface LoaderResponse {
    url: string
    // TODO(jstackhouse): SharedArrayBuffer, es2017 extension to TS
    data: string | ArrayBuffer
}

export interface LoaderStats {
    // performance.now() just after load() has been called
    trequest: number
    // performance.now() of first received byte
    tfirst: number
    // performance.now() on load complete
    tload: number
    // performance.now() on parse completion
    tparsed?: number
    // number of loaded bytes
    loaded: number
    // total number of bytes
    total: number
    //  performance.now() of first bufffer
    tbuffered?: number
}
/**
 * xhr-load stats
 */
export interface XhrLoaderStats extends LoaderStats {
    aborted: boolean
    // 重试次数
    retry: number // xhr-loader 重试次数

    text?: string
}
export interface XhrLoaderResponse extends LoaderResponse {
    text?: string
}
export interface Frag {
    byteRangeStartOffset: number
    byteRangeEndOffset: number
    start: number
    duration: number
    type: string
    url: string
    sn: number
}

type LoaderOnSuccess<T extends LoaderContext> = (
    response: LoaderResponse,
    stats: XhrLoaderStats,
    context: T,
    networkDetails: any
) => void

type LoaderOnProgress<T extends LoaderContext> = (
    stats: LoaderStats,
    context: T,
    data: string | ArrayBuffer,
    networkDetails: any
) => void

export interface ResponseData {
    response: {
        code: string | number
        text: string
    }
}
export interface ErrorData {
    // 错误返回数据格式
    code: string | number
    text: string
}
type LoaderOnError<T extends LoaderContext> = (
    error: {
        // error status code
        code: number
        // error description
        text: string
    },
    context: T,
    networkDetails: any
) => void

export type timeoutData = {
    stats: XhrLoaderStats,
    context: LoaderContext,
    xhr: XMLHttpRequest | null
}

export type LoaderOnTimeout<T extends LoaderContext> = (
    stats: XhrLoaderStats,
    context: T,
    xhr: XMLHttpRequest | null
) => void

export interface LoaderCallbacks<T extends LoaderContext> {
    onSuccess: LoaderOnSuccess<T>
    onError: LoaderOnError<T>
    onTimeout: LoaderOnTimeout<T>
    onProgress?: LoaderOnProgress<T>
}

export interface Loader<T extends LoaderContext> {
    destroy(): void
    abort(): void
    load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<T>): void

    context: T
}

/**
 * `type` property values for this loaders' context object
 * @enum
 *
 */
export enum PlaylistContextType {
    MANIFEST = 'manifest',
    LEVEL = 'level',
    AUDIO_TRACK = 'audioTrack',
    SUBTITLE_TRACK = 'subtitleTrack'
}

/**
 * @enum {string}
 */
export enum PlaylistLevelType {
    MAIN = 'main',
    AUDIO = 'audio',
    SUBTITLE = 'subtitle'
}
export interface SingleLevels {
    // todo 确定level的结构
    url: string
    details: Level
    bitrate: number
    height: number
    audioCodec: string
    attrs: Attr
    videoCodec: 'string' // 使用的编码规则
}

export interface PlaylistLoaderContext extends LoaderContext {
    loader?: Loader<PlaylistLoaderContext>

    type: PlaylistContextType
    // the level index to load
    // level?: number | null
    // TODO: what is id?
    id: number | null
    // defines if the loader is handling a sidx request for the playlist
    isSidxRequest?: boolean
    // internal reprsentation of a parsed m3u8 level playlist
    levelDetails?: Level
}
