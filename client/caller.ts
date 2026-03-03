import { DtiAction, DtiMode, Base62 } from "@napp/dti-core";
import { fetch } from "cross-fetch";
import { DtiClientBuilder } from "./builder";
import { DtiClientRoute } from "./route";
import { BundleMeta } from "./bundler";
import { responseHandle } from "./errorhandle";

function getRandomInt(min: number, max: number) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

async function hmacSignBase64(secret: string, data: string) {
    const enc = new TextEncoder();



    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(data));
    const sigBytes = new Uint8Array(sigBuf);

    // base64 encode
    let bin = "";
    sigBytes.forEach(b => (bin += String.fromCharCode(b)));
    return btoa(bin);
}

export class DtiClientCaller<RESULT, PARAM> {

    private base62 = new Base62();
    private routeClient: DtiClientRoute;
    constructor(private meta: DtiAction<RESULT, PARAM>, private builder: DtiClientBuilder) {
        this.routeClient = new DtiClientRoute(meta.getRoute(), builder);
    }

    validate(param: PARAM) {
        this.meta.validate(param);
    }

    private getMethod() {
        let m = this.meta.getMode();

        if (m === DtiMode.QString || m === DtiMode.QJson) {
            return 'get'
        }

        return 'post'
    }

    private getBody(param: PARAM) {
        let m = this.meta.getMode();

        if (m === DtiMode.BJson) {
            if (param) {
                return JSON.stringify(param)
            }

        }

        if (m === DtiMode.BFrom) {
            // const formData = new FormData();
            // Object.keys(param as any).forEach(key => formData.append(key, (param as any)[key]));
            if (param) {
                return new URLSearchParams(param as any).toString()
            }
        }

        return undefined
    }
    private getQeury(param: PARAM) {
        let m = this.meta.getMode();
        if (m === DtiMode.QJson) {
            if (param) {
                let p = this.base62.encode(JSON.stringify(param));
                return new URLSearchParams({ p }).toString()
            }
        } else if (m === DtiMode.QString) {
            if (param) {
                let json = JSON.stringify(param);
                let obj = JSON.parse(json);
                return new URLSearchParams(obj).toString()
            }
        }

        return undefined
    }
    private getHeaders(param: PARAM): Record<string, string> {
        let m = this.meta.getMode();

        let headers: Record<string, string> = {};


        let confHeaderBuilder = this.builder.getHeader(this.meta.getRoute().getFullname());

        if (confHeaderBuilder) {
            let confHeaders = confHeaderBuilder(this.meta)

            headers = { ...headers, ...confHeaders };
        }




        if (m === DtiMode.BFrom) {
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        } else {
            headers["Content-Type"] = "application/json"
        }

        return headers;
    }

    private async signature(data: string) {
        const nonce: string = '' + getRandomInt(10000, 99999)
        const timestamp: string = '' + Math.round(Date.now() / 1000);
        const secretResolver = this.builder.getSignatureResolver();

        if (secretResolver) {
            const secret = await secretResolver();
            if (secret) {


                const signature = await hmacSignBase64(secret, `${timestamp}.${nonce}.${data}`)
                return {
                    nonce, timestamp, signature
                }
            }
        }



        return {
            nonce, timestamp,
            signature: ''
        }
    }



    private getUrl() {
        return this.routeClient.buildUrl(this.meta.getPath());
    }

    bundler(param: PARAM): BundleMeta<RESULT, PARAM> {
        return { meta: this.meta, param }
    }


    async call(param: PARAM): Promise<RESULT> {

        let resp = await this.callRaw(param)

        return await responseHandle<RESULT>(resp)
    }
    async callRaw(param: PARAM): Promise<Response> {
        this.validate(param);

        let url = this.getUrl();
        let query = this.getQeury(param);
        let method = this.getMethod();

        let headers = this.getHeaders(param);
        let body = this.getBody(param);


        const signData = this.meta.sign(param);
        if (signData) {
            const { nonce, signature, timestamp } = await this.signature(signData);
            if (signature) {
                // console.log('method', method)
                // console.log('------------method', method, this.meta.getFullname())
                // console.log('timestamp', timestamp)
                // console.log('nonce', nonce)
                // console.log('signature', signature)


                headers["X-DTI-Timestamp"] = timestamp
                headers["X-DTI-Nonce"] = nonce
                headers["X-DTI-Signature"] = signature
            }

        }


        return await fetch(url + (query ? `?${query}` : ''), {
            method, headers, body
        });


    }
}
