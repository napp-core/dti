import { DtiMode, DtiRoute } from "@napp/dti-core";
import { DtiServerAction } from "./action";
import { OSetupParam } from "./common";
import { DtiResponse } from "./response";
import { DtiServer } from "./server";
import base64url from "base64url";


export class DtiServerRoute {

    constructor(private meta: DtiRoute, private server: DtiServer) { }

    private param(action: DtiServerAction<any, any>, req: any) {
        let mode = action.meta.getMode();



        if (mode === DtiMode.QString) {
            return req.query;
        } else if (mode === DtiMode.QJson) {
            try {
                let p = req.query.p;
                if (p) {
                    let json = base64url.decode(p);
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
                    if (rsu instanceof DtiResponse) {
                        if (rsu.handle) {
                            return rsu.handle(res);
                        }
                        return res.end();
                    }
                    return res.json(rsu);
                })
                .catch(err => next(err));
        } catch (error) {
            return next(error)
        }
    }

    private setupAction(expressRoute: any, action: DtiServerAction<any, any>, setuper: OSetupParam) {
        let befores = action.before();
        let mode = action.meta.getMode();
        let path = action.meta.getPath();
        let endpoint = (req: any, res: any, next: any) => {
            this.callAction(action, req, res, next)
        };




        if (mode === DtiMode.QString || mode === DtiMode.QJson) {
            expressRoute.get(path, [...befores, endpoint]);
        } else if (mode === DtiMode.BJson) {
            expressRoute.post(path, [setuper.factoryBodyparseJson(action.meta), ...befores, endpoint]);
        } else if (mode === DtiMode.BFrom) {
            expressRoute.post(path, [setuper.factoryBodyparseUrlencode(action.meta), ...befores, endpoint]);
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