import base64url from "base64url";
import { IContext, OSetupParam } from "./common";
import { DtiServer } from "./server";


interface IMeteParam {
    name: string;
    param: any;
}

export class BundlerServer {

    constructor(private server: DtiServer) {

    }

    async action(meta: Array<IMeteParam>, ctx: IContext): Promise<any[]> {

        let actions: { (): Promise<any> }[] = []

        for (let it of meta) {
            let action = this.server.getActionByName(it.name);
            if (action) {
                action.validation(it.param);

                // console.log('call', it.name, it.param, await action?.action(it.param, ctx))

                actions.push(async () => await action?.action(it.param, ctx))
            } else {
                throw new Error('not defined action. name=' + it.name)
            }
        }




        return await Promise.all(actions.map(it => it()))
    }

    setup(expressRoute: any, setuper: OSetupParam) {
        if (setuper.factoryBodyparseJson) {
            expressRoute.post('/__bundler_post__', setuper.factoryBodyparseJson(), async (req: any, res: any, next: any) => {
                try {
                    let meta: Array<IMeteParam> = req.body || [];
                    let result = await this.action(meta, { req, res });
                    res.json(result);
                } catch (error) {
                    next(error)
                }

            })
            expressRoute.get('/__bundler_get__', async (req: any, res: any, next: any) => {
                try {
                    let p = req.query?.p;
                    if (p) {
                        let json = base64url.decode(p);
                        let meta: Array<IMeteParam> = JSON.parse(json);

                        let result = await this.action(meta, { req, res });
                        res.json(result);

                    } else {
                        res.json([])
                    }
                } catch (error) {
                    next(error)
                }
            })
        } else {
            throw new Error('not defined server.factoryBodyparseJson')
        }

    }
}