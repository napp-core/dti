import { DtiError, DtiRoute } from "@napp/dti-core";
import { DtiServerAction } from "./action";
import { IMiddleware, OSetupParam } from "./common";
import { DtiServerRoute } from "./route";

export interface ODtiServer {

}
export interface IRawActionBuilder {
    (expressRoute: any): void
}
export class DtiServer {

    constructor(private root: DtiRoute, private opt: ODtiServer) { }

    private _actions = new Map<string, DtiServerAction<any, any>>();
    private _raws = new Map<string, IRawActionBuilder[]>();
    register(...actions: DtiServerAction<any, any>[]) {

        for (let action of actions) {
            let name = action.meta.getFullname();
            if (this._actions.has(name)) {
                throw new Error(`already registed(${name})`)
            }

            this._actions.set(name, action);
        }

        return this;
    }


    rawRegister(route: DtiRoute, ...handlers: IRawActionBuilder[]) {
        let name = route.getFullname();
        if (this._raws.has(name)) {
            let olds = this._raws.get(name) || [];
            this._raws.set(name, [...olds, ...handlers]);
        } else {
            this._raws.set(name, [...handlers]);
        }
    }


    getActionByName(name: string) {
        return this._actions.get(name)
    }

    getRawByName(name: string) {
        return this._raws.get(name);
    }


    static setup(server: DtiServer, setuper: OSetupParam) {
        let route = setuper.factoryExpressRouter(server.root);        
        route.use(server.root.getLocalPath(), new DtiServerRoute(server.root, server).setup(setuper))

        route.use((err: any, req: any, res: any, next: any) => {
            res.status(500).json(DtiError.from(err).toPlanObject())
        })
        return route;
    }

}