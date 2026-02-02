
import base from 'base-x'
export class Base62 {
    private convert: base.BaseConverter;
    private utf8Encode = new TextEncoder();
    private utf8Decoder = new TextDecoder();
    constructor(ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        this.convert = base(ALPHABET);
    }

    encode(str: string) {
        let bytes = this.utf8Encode.encode(str)
        let txt: string = this.convert.encode(bytes);
        return txt;
    }

    decode(str: string) {
        let bytes = this.convert.decode(str);
        let txt: string = this.utf8Decoder.decode(bytes)
        return txt;
    }

}