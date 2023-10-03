import { DtiMode, DtiRoute, Base62, DtiRawResponse } from "@napp/dti-core";
import { DtiServerAction } from "./action";
import { OSetupParam } from "./common";

import { DtiServer } from "./server";



export class DtiServerRoute {
    private base62 = new Base62();
    constructor(private meta: DtiRoute, private server: DtiServer) { }

    private param(action: DtiServerAction<any, any>, req: any) {
        let mode = action.meta.getMode();



        if (mode === DtiMode.QString) {
            return req.query;
        } else if (mode === DtiMode.QJson) {
            try {
                let p = req.query?.p;
                if (p) {
                    let json = this.base62.decode(p);
                    return JSON.parse(json);
                }

            } catch (error) {

            }
            return {}
        } else if (mode === DtiMode.BJson || mode === DtiMode.BFrom) {
            return req.body;

        }


        throw new Error('not supported mode')
    }

    private callAction(sa: DtiServerAction<any, any>, req: any, res: any, next: any) {
        try {
            let param = this.param(sa, req);
            sa.validation(param);
            return sa.action(param, { req, res })
                .then(rsu => {
                    if (DtiRawResponse.is(rsu) === false) {
                        return res.json(rsu);
                    }
                })
                .catch(err => next(err));
        } catch (error) {
            return next(error)
        }
    }

    private setupAction(expressRoute: any, action: DtiServerAction<any, any>, setuper: OSetupParam) {

        let mode = action.meta.getMode();
        let path = action.meta.getPath();
        let endpoint = (req: any, res: any, next: any) => {
            this.callAction(action, req, res, next)
        };




        if (mode === DtiMode.QString || mode === DtiMode.QJson) {
            expressRoute.get(path, endpoint);
        } else if (mode === DtiMode.BJson) {
            if (setuper.factoryBodyparseJson) {
                expressRoute.post(path, [setuper.factoryBodyparseJson(), endpoint]);
            } else {
                throw new Error('not define server.factoryBodyparseJson');
            }
        } else if (mode === DtiMode.BFrom) {
            if (setuper.factoryBodyparseUrlencode) {
                expressRoute.post(path, [setuper.factoryBodyparseUrlencode(), endpoint]);
            } else {
                throw new Error('not define server.factoryBodyparseUrlencode');
            }

        } else {
            throw new Error("not support methid. logic error")
        }
    }

    private setupActions(expressRoute: any, setuper: OSetupParam) {
        let actions = this.meta.getActions();

        for (let a of actions) {
            let name = a.getFullname();
            let action = this.server.getActionByName(name);
            if (action) {
                this.setupAction(expressRoute, action, setuper);
            } else {
                console.warn(`not registered server action. action(${name})`)
            }
        }
    }
    private setupRaws(expressRoute: any, setuper: OSetupParam) {
        let name = this.meta.getFullname();
        let handles = this.server.getRawByName(name);

        if (Array.isArray(handles)) {
            for (let handle of handles) {
                handle(expressRoute);
            }
        }
    }

    setup(setuper: OSetupParam) {
        let pRoute = setuper.factoryExpressRouter(this.meta);



        this.setupActions(pRoute, setuper);
        this.setupRaws(pRoute, setuper);

        for (let dtiRoute of this.meta.getChildroutes()) {
            let lRoute = new DtiServerRoute(dtiRoute, this.server).setup(setuper);
            (pRoute as any).use(dtiRoute.getLocalPath(), lRoute);
        }





        return pRoute;

    }
}