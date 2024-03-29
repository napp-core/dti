import { DtiAction, DtiMode, Base62 } from "@napp/dti-core";
import { fetch } from "cross-fetch";
import { DtiClientBuilder } from "./builder";
import { DtiClientRoute } from "./route";
import { BundleMeta } from "./bundler";
import { responseHandle } from "./errorhandle";



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



        return await fetch(url + (query ? `?${query}` : ''), {
            method, headers, body
        });


    }
}
