import { DtiAction } from "@napp/dti-core";
import { IContext, IMiddleware } from "./common";

export abstract class DtiServerAction<RESULT, PARAM> {

    abstract meta: DtiAction<RESULT, PARAM>;

    abstract action(param: PARAM, ctx: IContext): Promise<RESULT>;

    before(): Array<IMiddleware> {
        return [];
    }

    validation(param: PARAM) {
        this.meta.validate(param)
    }


}

export interface ODtiServerActionFactory<RESULT, PARAM> {
    action: (param: PARAM, ctx: IContext) => Promise<RESULT>;

    before?: Array<IMiddleware>;
}
export class DtiServerActionFactory<RESULT, PARAM> extends DtiServerAction<RESULT, PARAM>  {

    private constructor(public meta: DtiAction<RESULT, PARAM>, private opt: ODtiServerActionFactory<RESULT, PARAM>) {
        super();
    }

    before(): Array<IMiddleware> {
        return this.opt.before || [];
    }

    action(param: PARAM, ctx: IContext): Promise<RESULT> {
        return this.opt.action(param, ctx);
    }


    static factory<RESULT, PARAM>(meta: DtiAction<RESULT, PARAM>, opt: ODtiServerActionFactory<RESULT, PARAM>) {
        return new DtiServerActionFactory(meta, opt);
    }
}