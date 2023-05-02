import { DtiAction, DtiMode } from "@napp/dti-core";
import { Exception } from "@napp/exception";
import { DtiClientBuilder } from "./builder";
import { fetch } from "cross-fetch";
import base64url from "base64url";
import { responseHandle } from "./errorhandle";

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
        this.validate();

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
            return await responseHandle(resp);
        } catch (error) {
            throw Exception.from(error)
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

            return await responseHandle(resp);
        } catch (error) {
            throw Exception.from(error)
        }
    }

    


}