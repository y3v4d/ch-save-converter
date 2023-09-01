import { deflate, deflateRaw, inflate, inflateRaw } from "pako";

export enum EncodingType {
    NONE = 'none',
    ZLIB = 'zlib',
    DEFLATE = 'deflate'
}

export enum SavePlatform {
    PC = 'pc',
    MOBILE = 'mobile'
}

export interface SaveData {
    rubies: number,
    platform: string,
    saveOrigin: string
}

export default class Save {
    static readonly HASH_LENGTH = 32;

    static readonly zlibHash = '7a990d405d2c6fb93aa8fbb0ec1a3b23';
    static readonly deflateHash = '7e8bb5a89f2842ac4af01b3b7e228592';

    static readonly encodings: { [key: string]: EncodingType } = {
        [this.zlibHash]: EncodingType.ZLIB,
        [this.deflateHash]: EncodingType.DEFLATE
    };

    public encoding: EncodingType = EncodingType.NONE;
    public data: SaveData;

    constructor(save: string) {
        this.encoding = Save.determinateEncodingType(save);
        this.data = Save.decode(save);
    }

    clone() {
        return new Save(this.encode());
    }

    encode() {
        return Save.encode(this.data, this.encoding);
    }

    private static determinateEncodingType(data: string) {
        const hash = data.slice(0, this.HASH_LENGTH);
        return this.encodings[hash];
    }

    private static decode(data: string) {
        if(data.length < this.HASH_LENGTH) {
            throw new Error('Invalid save data passed.');
        }
        
        const hash = data.slice(0, this.HASH_LENGTH);
        const type = this.encodings[hash];
        if(!type) {
            throw new Error('Invalid save data passed.');
        }

        if(type == EncodingType.DEFLATE) {
            return this.decodeDeflate(data);
        } else if(type == EncodingType.ZLIB) {
            return this.decodeZlib(data);
        }

        throw new Error("Can't decode save data");
    }

    private static encode(data: SaveData, targetType: EncodingType) {
        if(targetType == EncodingType.DEFLATE) {
            return this.encodeDeflate(data);
        } else if(targetType == EncodingType.ZLIB) {
            return this.encodeZlib(data);
        }

        throw new Error("Can't encode save data");
    }

    private static encodeDeflate(data: SaveData) {
        const str = JSON.stringify(data);
        const compressed = deflateRaw(str);

        const encoded = btoa(String.fromCharCode(...compressed));
        return this.deflateHash + encoded;
    }

    private static decodeDeflate(data: string) {
        const decodedData = atob(data.slice(this.HASH_LENGTH));
        const charData = decodedData.split("").map(o => o.charCodeAt(0));
        const binData = new Uint8Array(charData);

        const decompressed = inflateRaw(binData, { to: 'string' });
        return JSON.parse(decompressed) as SaveData;
    }

    private static encodeZlib(data: SaveData) {
        const str = JSON.stringify(data);
        const compressed = deflate(str);

        const encoded = btoa(String.fromCharCode(...compressed));
        return this.zlibHash + encoded;
    }

    private static decodeZlib(data: string) {
        const decodedData = atob(data.slice(this.HASH_LENGTH));
        const charData = decodedData.split("").map(o => o.charCodeAt(0));
        const binData = new Uint8Array(charData);

        const decompressed = inflate(binData, { to: 'string' });
        return JSON.parse(decompressed) as SaveData;
    }
}