/*
 * Copyright (C) 2016 Bilibili. All Rights Reserved.
 *
 * @author zheng qian <xqq@xqq.im>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Log from '../Utils/Logger';
import BaseLoader from './BaseLoader';
import { RuntimeException } from '../Utils/Exception';

import LoaderStatus from './LoaderStatus';
import LoaderErrors from './LoaderErrors';

import UserConfig from '../Interfaces/UserConfig';
import MediaConfig from '../Interfaces/MediaConfig';
import SeekRange from '../Interfaces/SeekRange';
import SeekHandler, { SeekConfig } from '../Interfaces/SeekHandler';
import ErrorData from '../Interfaces/ErrorData';
import HJPlayerConfig from '../Interfaces/HJPlayerConfig';

// For FireFox browser which supports `xhr.responseType = 'moz-chunked-arraybuffer'`
class MozChunkedLoader extends BaseLoader {
    public Tag: string = 'MozChunkedLoader'

    private _seekHandler: SeekHandler

    private _config: UserConfig

    public _needStash: boolean = true

    private _xhr: XMLHttpRequest | null = null

    /**
     * 请求流的url
     */
    private _requestURL: string = ''

    /**
     * 是否终止请求
     */
    private _requestAbort: boolean = false

    /**
     * 数据的长度
     */
    private _contentLength: number = 0

    /**
     * 接收到的数据长度
     */
    private _receivedLength: number = 0

    /**
     * 请求流的配置
     */
    private _dataSource: MediaConfig | null = null

    /**
     * 数据请求的范围
     */
    private _range: SeekRange = { from: 0, to: -1 }

    static isSupported() {
        try {
            const xhr = new XMLHttpRequest();
            // Firefox 37- requires .open() to be called before setting responseType
            xhr.open('GET', 'https://example.com', true);
            xhr.responseType = <XMLHttpRequestResponseType>'moz-chunked-arraybuffer';
            return xhr.responseType === <XMLHttpRequestResponseType>'moz-chunked-arraybuffer';
        } catch (e) {
            Log.warn('MozChunkedLoader', e.message);
            return false;
        }
    }

    constructor(seekHandler: SeekHandler, config: HJPlayerConfig) {
        super('xhr-moz-chunked-loader', 'moz-chunked');

        this._seekHandler = seekHandler;
        this._config = config;
    }

    destroy() {
        if(this.isWorking()) {
            this.abort();
        }
        if(this._xhr) {
            this._xhr.onreadystatechange = null;
            this._xhr.onprogress = null;
            this._xhr.onloadend = null;
            this._xhr.onerror = null;
            this._xhr = null;
        }
        super.destroy();
    }

    startLoad(dataSource: MediaConfig, range: SeekRange) {
        this._dataSource = dataSource;
        this._range = range;

        let sourceURL = dataSource.url;
        if(this._config.reuseRedirectedURL && dataSource.redirectedURL !== undefined) {
            sourceURL = dataSource.redirectedURL;
        }

        const seekConfig: SeekConfig = this._seekHandler.getConfig(sourceURL, range);
        this._requestURL = seekConfig.url;
        this._xhr = new XMLHttpRequest();
        const xhr: XMLHttpRequest = this._xhr;
        xhr.open('GET', seekConfig.url, true);
        xhr.responseType = <XMLHttpRequestResponseType>'moz-chunked-arraybuffer';
        xhr.onreadystatechange = this._onReadyStateChange.bind(this);
        xhr.onprogress = this._onProgress.bind(this);
        xhr.onloadend = this._onLoadEnd.bind(this);
        xhr.onerror = this._onXhrError.bind(this);

        // cors is auto detected and enabled by xhr

        // withCredentials is disabled by default
        if(dataSource.withCredentials) {
            xhr.withCredentials = true;
        }

        if(typeof seekConfig.headers === 'object') {
            const { headers } = seekConfig;
            Object.keys(headers).forEach((key) => {
                xhr.setRequestHeader(key, headers[key]);
            });
        }

        // add additional headers
        if(typeof this._config.headers === 'object') {
            const { headers } = this._config;
            Object.keys(headers).forEach((key) => {
                xhr.setRequestHeader(key, headers[key]);
            });
        }

        this._status = LoaderStatus.kConnecting;
        xhr.send();
    }

    abort() {
        this._requestAbort = true;
        if(this._xhr) {
            this._xhr.abort();
        }
        this._status = LoaderStatus.kComplete;
    }

    _onReadyStateChange(e: Event): void {
        const xhr = <XMLHttpRequest>e.target;

        if(xhr.readyState === 2) {
            // HEADERS_RECEIVED
            if(xhr.responseURL !== undefined && xhr.responseURL !== this._requestURL) {
                if(this._onURLRedirect) {
                    const redirectedURL = this._seekHandler.removeURLParameters(xhr.responseURL);
                    this._onURLRedirect(redirectedURL);
                }
            }

            if(xhr.status !== 0 && (xhr.status < 200 || xhr.status > 299)) {
                this._status = LoaderStatus.kError;
                if(this._onError) {
                    this._onError(LoaderErrors.HTTP_STATUS_CODE_INVALID, {
                        code: xhr.status,
                        reason: xhr.statusText
                    });
                } else {
                    throw new RuntimeException(
                        `MozChunkedLoader: Http code invalid, ${xhr.status} ${xhr.statusText}`
                    );
                }
            } else {
                this._status = LoaderStatus.kBuffering;
            }
        }
    }

    _onProgress(e: ProgressEvent): void {
        if(this._status === LoaderStatus.kError) {
            // Ignore error response
            return;
        }

        if(this._contentLength === null) {
            if(e.total !== null && e.total !== 0) {
                this._contentLength = e.total;
                if(this._onContentLengthKnown) {
                    this._onContentLengthKnown(this._contentLength);
                }
            }
        }

        const chunk = (<XMLHttpRequest>e.target).response;
        const byteStart = this._range.from + this._receivedLength;
        this._receivedLength += chunk.byteLength;

        if(this._onDataArrival) {
            this._onDataArrival(chunk, byteStart, this._receivedLength);
        }
    }

    _onLoadEnd(e: Event) {
        if(this._requestAbort === true) {
            this._requestAbort = false;
            return;
        } if(this._status === LoaderStatus.kError) {
            return;
        }

        this._status = LoaderStatus.kComplete;
        if(this._onComplete) {
            this._onComplete(this._range.from, this._range.from + this._receivedLength - 1);
        }
    }

    _onXhrError(e: ProgressEvent) {
        this._status = LoaderStatus.kError;
        let type: number | string = 0;
        let info: ErrorData | null = null;

        if(this._contentLength && e.loaded < this._contentLength) {
            type = LoaderErrors.EARLY_EOF;
            info = { code: -1, reason: 'Moz-Chunked stream meet Early-Eof' };
        } else {
            type = LoaderErrors.EXCEPTION;
            info = { code: -1, reason: `${e.constructor.name} ${e.type}` };
        }

        if(this._onError) {
            this._onError(type, info);
        } else {
            throw new RuntimeException(info.reason);
        }
    }
}

export default MozChunkedLoader;
