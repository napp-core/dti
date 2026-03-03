import type { DtiAction } from "@napp/dti-core";
import type { IContext } from "./common";
import type { DtiServer } from "./server";
import type { Request } from "express";
import { createHmac, timingSafeEqual } from "node:crypto";
export interface ODtiServerAction<RESULT, PARAM> {
    action: (param: PARAM, ctx: IContext) => Promise<RESULT>;

}



function createHmacString(secret: string, data: string) {


    const expected = createHmac("sha256", secret)
        .update(data, "utf8")
        .digest("base64");

    return expected;
}

export class DtiServerAction<RESULT, PARAM> {

    private constructor(public meta: DtiAction<RESULT, PARAM>, private opt: ODtiServerAction<RESULT, PARAM>) {

    }

    action(param: PARAM, ctx: IContext): Promise<RESULT> {
        return this.opt.action(param, ctx);
    }



    async validation(server: DtiServer, param: PARAM, req: Request, isBundler=false) {
        this.meta.validate(param);



        if (server.signatureSecret && isBundler === false) {
            const data = this.meta.sign(param);
            if (data) {
                
                const timestamp: string = req.get('X-DTI-Timestamp') ?? ''
                const nonce: string = req.get('X-DTI-Nonce') ?? ''
                const signature: string = req.get('X-DTI-Signature') ?? ''

                if(!(timestamp && nonce && signature)) {
                    throw new Error('requared signature')
                }

                const secret = await server.signatureSecret();
                const expected = createHmacString(secret, `${timestamp}.${nonce}.${data}`);

                // console.log('--------method', req.method, this.meta.getFullname() )
                // console.log('secret', secret)
                // console.log('timestamp', timestamp)
                // console.log('nonce', nonce)
                // console.log('signature', signature)
                // console.log('expected', expected)

                

                const a: Buffer = Buffer.from(expected, "base64");
                const b: Buffer = Buffer.from(signature, 'base64');

                if (a.length !== b.length) {
                    throw new Error("invalid signature")
                }

                const valid = timingSafeEqual(
                    new Uint8Array(a),
                    new Uint8Array(b)
                );

                if (valid === false) {
                    throw new Error("invalid signature")
                }
            }
        }
    }

    static factory<RESULT, PARAM>(meta: DtiAction<RESULT, PARAM>, opt: ODtiServerAction<RESULT, PARAM>) {
        return new DtiServerAction(meta, opt);
    }
}
