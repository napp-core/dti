import { DtiAction, DtiRoute } from "@napp/dti-core";
import { DtiClientBuilder } from "./builder";
import { DtiClientRoute } from "./route";
import { DtiClientCaller } from "./caller";
import { DtiClientBandler, BundleMeta } from "./bundler";


export class DtiClient {

    constructor(private builder: DtiClientBuilder) {

    }



    dti<RESULT, PARAM>(meta: DtiAction<RESULT, PARAM>) {
        return new DtiClientCaller<RESULT, PARAM>(meta, this.builder);
    }

    buildUrl(route: DtiRoute, actionPath: string): string {
        return new DtiClientRoute(route, this.builder).buildUrl(actionPath);
    }


    async bundle<R1, P1, R2, P2, R3, P3, R4, P4, R5, P5, R6, P6>(m1: BundleMeta<R1, P1>, m2?: BundleMeta<R2, P2>, m3?: BundleMeta<R3, P3>, m4?: BundleMeta<R4, P4>, m5?: BundleMeta<R5, P5>, m6?: BundleMeta<R6, P6>): Promise<[R1, R2, R3, R4, R5, R6]> {
        let bundleMetas: Array<BundleMeta<any, any>> = [m1];
        if (m2) {
            bundleMetas.push(m2)
        }
        if (m3) {
            bundleMetas.push(m3)
        }
        if (m4) {
            bundleMetas.push(m4)
        }
        if (m5) {
            bundleMetas.push(m5)
        }
        if (m6) {
            bundleMetas.push(m6)
        }
        return await new DtiClientBandler(bundleMetas, this.builder).call();
    }




}




