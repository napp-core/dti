import { DtiAction, DtiError, DtiErrorUnknown, DtiMode } from "@napp/dti-core";
import { fetch } from "cross-fetch";
import base64url from "base64url";
import { DtiClientBuilder } from "./builder";
import { DtiClientRoute } from "./route";

export class DtiClientCaller<RESULT, PARAM> {

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
                let p = base64url.encode(JSON.stringify(param));
                return new URLSearchParams({ p }).toString()
            }
        } else if (m === DtiMode.QString) {
            if (param) {
                return new URLSearchParams(param as any).toString()
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



    async call(param: PARAM): Promise<RESULT> {
        try {
            this.validate(param);
        } catch (error) {
            throw DtiError.fromCode('validation', error)
        }






        let url = this.getUrl();
        let query = this.getQeury(param);
        let method = this.getMethod();

        let headers = this.getHeaders(param);
        let body = this.getBody(param);

       

        let resp = await fetch(url + (query ? `?${query}` : ''), {
            method, headers, body
        });

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
