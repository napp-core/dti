import { DtiAction } from "@napp/dti-core";
import { IContext, IMiddleware } from "./common";

export interface ODtiServerAction<RESULT, PARAM> {
    action: (param: PARAM, ctx: IContext) => Promise<RESULT>;

    before?: Array<IMiddleware>;
}

export class DtiServerAction<RESULT, PARAM> {

    private constructor(public meta: DtiAction<RESULT, PARAM>, private opt: ODtiServerAction<RESULT, PARAM>) {
        
    }

    action(param: PARAM, ctx: IContext): Promise<RESULT> {
        return this.opt.action(param, ctx);
    }

    before(): Array<IMiddleware> {
        return this.opt.before || [];
    }

    validation(param: PARAM) {
        this.meta.validate(param)
    }

    static factory<RESULT, PARAM>(meta: DtiAction<RESULT, PARAM>, opt: ODtiServerAction<RESULT, PARAM>) {
        return new DtiServerAction(meta, opt);
    }
}
