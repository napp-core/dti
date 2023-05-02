import { Exception } from "@napp/exception";
export async function responseHandle(resp: Response) {

    try {
        let resu = await resp.text();
        if (resp.ok) {
            try {
                return resu ? JSON.parse(resu) : undefined
            } catch (error) {
                throw new Exception("api response invalid json")
                    .addException(Exception.from(error))
            }
        }



        if (resu) {
            let errObject = JSON.parse(resu);
            throw Exception.from(errObject);
        }

        throw new Exception(resp.statusText).setStatus(resp.status);

    } catch (error) {
        throw Exception.from(error)
    }

}