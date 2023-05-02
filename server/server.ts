import { DtiRoute } from "@napp/dti-core";
import { DtiServerAction } from "./action";
import { OSetupParam } from "./common";
import { DtiServerRoute } from "./route";
import { BundlerServer } from "./bundler";
import { Exception } from "@napp/exception";

export interface IRawActionBuilder {
    (expressRoute: any): void
}
export class DtiServer {

    constructor(private root: DtiRoute) { }

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

        return this;
    }


    getActionByName(name: string) {
        return this._actions.get(name)
    }

    getRawByName(name: string) {
        return this._raws.get(name);
    }


    static setup(server: DtiServer, setuper: OSetupParam) {
        let route = setuper.factoryExpressRouter(server.root);
        new BundlerServer(server).setup(route, setuper);
        route.use(server.root.getLocalPath(), new DtiServerRoute(server.root, server).setup(setuper));
        route.use((err: any, req: any, res: any, next: any) => {
            let error = Exception.from(err);
            let status = error.status || 500;

            res.status(status).json(error.toPlan())
        })
        return route;
    }

}