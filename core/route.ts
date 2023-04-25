import { DtiAction } from "./action";



export interface ODtiRoute {
    path?: string;
}

export class DtiRoute {

    private constructor(public name: string) {

    }
    private _parent?: DtiRoute;
    private _children?: DtiRoute[];
    private _actions?: DtiAction<any, any>[];
    private path?: string;


    getChildroutes() {
        return this._children || []
    }

    regChildroute(route: DtiRoute) {

        if (route._parent) {
            throw new Error(`cannot register the route ("${route.name}") on route ("${this.name}"). already registered #"${route._parent.name}"  `)
        }

        route._parent = this;
        this._children = [...this._children || [], route];

        return this;
    }

    getActions() {
        return this._actions || []
    }
    regAction<RESULT, PARAM>(action: DtiAction<RESULT, PARAM>) {
        // if (action.getRoute()) {
        //     throw new Error(`the action(${action.name}) already registed. registered route(${action.route.name})`)
        // }
        let name = action.getName();
        for (let a of this._actions || []) {
            if (a.getName() === name) {
                throw new Error(`the action(${name}) is registered`)
            }
        }



        this._actions = [...this._actions || [], action];

        return this;
    }

    getNames(): string[] {
        if (this._parent) {
            let paths = this._parent.getNames();
            return [...paths, this.name];
        }
        return [this.name];
    }

    getFullname() {
        return this.getNames().join('.')
    }



    getPaths(): string[] {
        if (this._parent) {
            let paths = this._parent.getPaths();
            return [...paths, this.getLocalPath()];
        }
        return [this.getLocalPath()];
    }

    getLocalPath() {
        return `/${this.path || this.name}`;
    }



    static factory(name: string, opt?: ODtiRoute) {
        let route = new DtiRoute(name);

        if (opt?.path) {
            route.path = opt.path;
        }


        return route;
    }

}




