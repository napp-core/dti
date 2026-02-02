import { Exception } from "@napp/exception";
export async function responseHandle<T>(resp: Response, parser?: (errObject: any) => Exception | undefined) {

    try {
        let rsu = await resp.text();
        if (resp.ok) {
            if (rsu) {
                try {
                    let value: T = JSON.parse(rsu)
                    return value;
                } catch (error) {
                    throw new Exception(rsu, {
                        kind: 'serviceunavailable',
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
                    let e1 = parser(errObject);
                    if (e1) {
                        err = e1;
                    } else {
                        err = Exception.from(errObject);
                    }
                } else {
                    err = Exception.from(errObject);
                }

            } catch (error) {
                err = new Exception(rsu, {
                    kind: 'serviceunavailable',
                })
            }
            throw err;
        }
        throw new Exception(`status=${resp.status}. ${resp.statusText}`, {
            kind: 'serviceunavailable',
        })

    } catch (error) {
        throw Exception.from(error)
    }

}