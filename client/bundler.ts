import { DtiAction, DtiError, DtiErrorUnknown, DtiMode } from "@napp/dti-core";
import { DtiClientBuilder } from "./builder";
import { fetch } from "cross-fetch";
import base64url from "base64url";

export interface BundleMeta<RESULT, PARAM> {

    meta: DtiAction<RESULT, PARAM>;

    param: PARAM;

}

export class DtiClientBandler {


    constructor(private bundleMetas: Array<BundleMeta<any, any>>, private builder: DtiClientBuilder) {


    }

    validate() {
        for (let it of this.bundleMetas) {
            it.meta.validate(it.param);
        }
    }

    private getMethod() {
        for (let it of this.bundleMetas) {
            let m = it.meta.getMode();

            if (m === DtiMode.BFrom || m === DtiMode.BJson) {
                return 'post'
            }
        }

        return 'get'
    }



    private getBase() {
        for (let it of this.bundleMetas) {

            let base = this.builder.getBaseUrl(it.meta.getFullname());

            if (base) {
                return base;
            }
        }
        return ''
    }

    getParam() {
        let param: { name: string, param: any }[] = [];

        for (let it of this.bundleMetas) {

            param.push({
                name: it.meta.getFullname(),
                param: it.param
            })
        }

        return param;
    }

    private getHeaders(): Record<string, string> {


        let headers: Record<string, string> = {};

        for (let it of this.bundleMetas) {

            let _headers = this.builder.getHeader(it.meta.getRoute().getFullname());

            if (_headers) {
                headers = { ...headers, ..._headers };
            }
        }


        headers["Content-Type"] = "application/json"

        return headers;
    }

    async call() {

        try {
            this.validate();
        } catch (error) {
            throw DtiError.fromCode('validation', error)
        }

        

        let method = this.getMethod();

        if (method === 'get') {
            return await this.callGet();
        }

        return await this.callPost();
    }

    private async callGet() {
        try {
            let baseUrl = this.getBase();
            let param = this.getParam();
            let headers = this.getHeaders();

            let p = base64url.encode(JSON.stringify(param));
            let q = new URLSearchParams({ p }).toString();

            let resp = await fetch(`${baseUrl}/__bundler_get__?${q}`, {
                method: 'get', headers
            });
            return await this.respHandle(resp);
        } catch (error) {
            throw DtiError.from(error)
        }
    }
    private async callPost() {
        try {
            let baseUrl = this.getBase();
            let param = this.getParam();
            let headers = this.getHeaders();



            let resp = await fetch(`${baseUrl}/__bundler_post__`, {
                method: 'post', headers, body: JSON.stringify(param)
            });

            return await this.respHandle(resp);
        } catch (error) {
            throw DtiError.from(error)
        }
    }

    private async respHandle(resp: Response) {

        try {
            let resu = await resp.text();
            if (resp.ok) {
                try {
                    return JSON.parse(resu);
                } catch (error) {
                    throw DtiError.fromCode("InvalidJSON", resu)
                }
            }



            try {
                let errObject = JSON.parse(resu);
                let error = DtiError.from(errObject);
                if (error instanceof DtiErrorUnknown) {
                    throw new DtiError('' + resp.status, resp.statusText);
                }
                throw error;
            } catch (error) {
                throw new DtiErrorUnknown(resu)
            }

        } catch (error) {
            throw DtiError.from(error)
        }

    }


}