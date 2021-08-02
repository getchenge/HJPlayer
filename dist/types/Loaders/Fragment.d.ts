import LevelKey from '../Parser/LevelKey';
import { PlaylistLevelType } from '../Interfaces/Loader';
export declare enum ElementaryStreamTypes {
    AUDIO = "audio",
    VIDEO = "video"
}
export default class Fragment {
    Tag: string;
    private _url;
    private _byteRange;
    private _decryptdata;
    private _elementaryStreams;
    deltaPTS: number;
    rawProgramDateTime: string | null;
    programDateTime: number | null;
    title: string | null;
    tagList: Array<string[]>;
    cc: number;
    type: PlaylistLevelType;
    relurl: string;
    baseurl: string;
    duration: number;
    start: number;
    sn: number | 'initSegment';
    urlId: number;
    level: number;
    levelkey?: LevelKey;
    loader: any;
    setByteRange(value: string, previousFrag?: Fragment): void;
    get url(): string | null;
    set url(value: string | null);
    get byteRange(): number[];
    /**
     * @type {number}
     */
    get byteRangeStartOffset(): number;
    get byteRangeEndOffset(): number;
    get decryptdata(): LevelKey | null;
    get endProgramDateTime(): number | null;
    get encrypted(): boolean;
    /**
     * @param {ElementaryStreamTypes} type
     */
    addElementaryStream(type: ElementaryStreamTypes): void;
    /**
     * @param {ElementaryStreamTypes} type
     */
    hasElementaryStream(type: ElementaryStreamTypes): boolean;
    /**
     * Utility method for parseLevelPlaylist to create an initialization vector for a given segment
     * @param {number} segmentNumber - segment number to generate IV with
     * @returns {Uint8Array}
     */
    createInitializationVector(segmentNumber: number): Uint8Array;
    /**
     * Utility method for parseLevelPlaylist to get a fragment's decryption data from the currently parsed encryption key data
     * @param levelkey - a playlist's encryption info
     * @param segmentNumber - the fragment's segment number
     * @returns {LevelKey} - an object to be applied as a fragment's decryptdata
     */
    setDecryptDataFromLevelKey(levelkey: LevelKey, segmentNumber: number): LevelKey;
}
