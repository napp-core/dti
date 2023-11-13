import { Exception, ExceptionNames } from "@napp/exception";
export async function responseHandle<T>(resp: Response, parser?: (errObject: any) => Exception) {

    try {
        let rsu = await resp.text();
        if (resp.ok) {
            if (rsu) {
                try {
                    let value: T = JSON.parse(rsu)
                    return value;
                } catch (error) {
                    throw new Exception(rsu, {
                        name: ExceptionNames.Server,
                    })
                }
            }
            return void 0 as T;
        }

        if (rsu) {
            let err: Exception;
            try {
                let errObject = JSON.parse(rsu);
                if (parser) {
                    err = parser(errObject)
                } else {
                    err = Exception.from(errObject);
                }

            } catch (error) {
                err = new Exception(rsu, {
                    name: ExceptionNames.Server,
                })
            }
            throw err;
        }
        throw new Exception(`status=${resp.status}. ${resp.statusText}`, {
            name: ExceptionNames.Server,
        })

    } catch (error) {
        throw Exception.from(error)
    }

}