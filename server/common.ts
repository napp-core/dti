import { DtiRoute } from "@napp/dti-core";

export interface IContext {
    req: any;
    res: any
}

export interface IMiddleware {
    (req: any, res: any, next: any): void
}
export interface IErrorHandle {
    (req: any, res: any, next: any): void
}

export interface IExpressRoute {
    get(path: string, handlers: IMiddleware[]): void;
    post(path: string, handlers: IMiddleware[]): void;
    use(path: string, route: IExpressRoute): void;
}

export interface OSetupParam {
    factoryExpressRouter(dtiRouter: DtiRoute): any
    factoryBodyparseJson?: () => IMiddleware
    factoryBodyparseUrlencode?: () => IMiddleware
    errorHandle?: IErrorHandle
}