import { Exception, ExceptionNames } from "@napp/exception";
export async function responseHandle(resp: Response) {

    try {

        if (resp.ok) {
            try {
                return await resp.json()
            } catch (error) {
                throw new Exception("not supported result", {
                    name: ExceptionNames.Server,
                    cause: Exception.from(error)
                })
            }
        }

        let resu = await resp.text();
        if (resu) {
            try {
                let errObject = JSON.parse(resu);
                throw Exception.from(errObject);
            } catch (error) {
                throw new Exception("not supported result", {
                    name: ExceptionNames.Server,
                    cause: new Exception(resu, { name: 'raw.result' })
                })
            }

        }

        throw new Exception("not supported result", {
            name: ExceptionNames.Server,
            cause: new Exception("server empty result", { name: 'raw.result' })
        })

    } catch (error) {
        throw Exception.from(error)
    }

}