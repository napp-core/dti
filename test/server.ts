import express, { Express, Request, Response } from 'express';


import { Test01Dti } from "./dti";
import { DtiServer, DtiServerAction } from "@napp/dti-server";


const userCreate = DtiServerAction.factory(Test01Dti.userCreate, {
    async action(param, ctx) {

        return {
            id: "newid",
            data: {
                age: param.age,
                name: param.name
            }
        }
    },
})

const userList = DtiServerAction.factory(Test01Dti.userList, {
    async action(param, ctx) {

        return {
            order: param.order,
            items: [{
                id: '1',
                age: 2,
                name: '3 -' + param.order
            }]
        }
    },
})





const customerCreate = DtiServerAction.factory(Test01Dti.customerCreate, {
    async action(param, ctx) {
        return {
            flag: true,
            data: [param.code, param.name]
        }
    },
})


const customerList = DtiServerAction.factory(Test01Dti.customerList, {
    async action(param, ctx) {
        return [param.code, param.name]
    },
})

const customervoid = DtiServerAction.factory(Test01Dti.customerVoid, {
    async action(param, ctx) {

    },
})

const serverAdmin = new DtiServer(Test01Dti.routeAdmin);
const serverWeb = new DtiServer(Test01Dti.routeWeb);


serverWeb.register(userCreate, userList);
serverWeb.rawRegister(Test01Dti.routeUser, Test01Dti.raw1);
serverAdmin.register(customerCreate, customerList, customervoid)




function setup() {
    const app: Express = express();
    const port = process.env.PORT || 3000;



    app.use('/web-api', DtiServer.setup(serverWeb, {
        factoryExpressRouter: () => express.Router(),
        factoryBodyparseJson: () => express.json(),
        factoryBodyparseUrlencode: () => express.urlencoded(),
    }))
    app.use('/admin-api', DtiServer.setup(serverAdmin, {
        factoryExpressRouter: () => express.Router(),
        factoryBodyparseJson: () => express.json(),
        factoryBodyparseUrlencode: () => express.urlencoded(),
    }))


    app.listen(port, () => {
        console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
    });


}

setup()