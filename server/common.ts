import { DtiAction, DtiRoute } from "@napp/dti-core";

export interface IContext {
    req: any;
    res: any
}

export interface IMiddleware {
    (req: any, res: any, next: any): void
}
export interface IExpressRoute {
    get(path: string, handlers: IMiddleware[]): void;
    post(path: string, handlers: IMiddleware[]): void;
    use(path: string, route: IExpressRoute): void;
}
export interface Logger {
    (level: string, message: string): void
}

export interface OSetupParam {
    factoryExpressRouter(dtiRouter: DtiRoute): any
    factoryBodyparseJson?: () => IMiddleware
    factoryBodyparseUrlencode?: () => IMiddleware


}