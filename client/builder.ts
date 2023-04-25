import { DtiAction, DtiRoute } from "@napp/dti-core";
import { TreeNamer } from "./tree";
import { DtiClient } from "./client";

export interface ODtiClientHeaderBuilder {
    (action: DtiAction<any, any>): Record<string, string>
}
export class DtiClientBuilder {

    private _baseUrls = new TreeNamer<string>("root");
    private _headers = new TreeNamer<ODtiClientHeaderBuilder>("root");



    baseUrl(route: DtiRoute, url: string) {
        this._baseUrls.set(route.getFullname(), url);
        return this;
    }

    getBaseUrl(name: string): string | undefined {
        let note = this._baseUrls.findParent(name);
        if (note) {
            return note.getValue();
        }
        return undefined;
    }


    header(route: DtiRoute, builder: ODtiClientHeaderBuilder) {
        this._headers.set(route.getFullname(), builder);
        return this;
    }

    getHeader(name: string): ODtiClientHeaderBuilder | undefined {
        let note = this._headers.findParent(name);
        if (note) {
            return note.getValue();
        }
        return undefined;
    }




    build() {
        return new DtiClient(this)
    }
}