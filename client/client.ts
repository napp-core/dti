import { DtiAction, DtiRoute } from "@napp/dti-core";
import { DtiClientBuilder } from "./builder";
import { DtiClientRoute } from "./route";
import { DtiClientCaller } from "./caller";




export class DtiClient {

    constructor(private builder: DtiClientBuilder) {

    }



    dti<RESULT, PARAM>(meta: DtiAction<RESULT, PARAM>) {
        return new DtiClientCaller<RESULT, PARAM>(meta, this.builder);
    }

    buildUrl(route: DtiRoute, actionPath: string): string {
        return new DtiClientRoute(route, this.builder).buildUrl(actionPath);
    }


}




