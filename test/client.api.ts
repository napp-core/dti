import { DtiClientBuilder } from "@napp/dti-client"
import { Test01Dti } from "./dti"

const secret = '123134564678979';

export const api = new DtiClientBuilder()
    .baseUrl(Test01Dti.routeWeb, 'http://localhost:3000/web-api')
    .baseUrl(Test01Dti.routeAdmin, 'http://localhost:3000/admin-api')
    .header(Test01Dti.routeAdmin, (action) => {

        return {
            secret: 'admin'
        }
    })
    .header(Test01Dti.routeUser, (action) => {
        return {
            'user-secret': action.getFullname()
        }
    })
    .signatureSecret(async () => secret)

    .build()


