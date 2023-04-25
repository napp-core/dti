import { DtiAction, DtiMode, DtiRoute } from "@napp/dti-core";
import { IRawActionBuilder } from "../server";


export namespace Test01Dti {
    export interface IUserItem {
        id: string;
        name: string;
        age: number;
    }
    export interface IUserListParam {
        order: string;
    }
    export interface IUserListResult {

        order: string;
        items: IUserItem[]
    }
  
    

    export interface UserCreateResult {
        id: string,
        data: {
            name: string;
            age: number;
        }
    }
    export interface UserPayload {
        name: string;
        age: number;
    }

    export interface CustomerPayload {
        name: string;
        code: string;
    }

    export interface CustomerCreateReslt {
        flag: boolean;
        data: [string, string];
    }




    export const routeUser = DtiRoute.factory("user", {
        path: 'user-route'
    });
    export const routeCustomer = DtiRoute.factory("customer");
    export const routeAdmin = DtiRoute.factory("admin");
    export const routeWeb = DtiRoute.factory("web");


    routeWeb
        .regChildroute(routeUser);

    routeAdmin
        .regChildroute(routeCustomer)



    export const userCreate = DtiAction.define<UserCreateResult, UserPayload>({
        name: 'user-create', mode: DtiMode.BJson,
        route: routeUser,
        validate(p) {
            if (!p.name) {
                throw new Error('name is requared');
            }
        },
    });
    export const userList = DtiAction.define<IUserListResult, IUserListParam>({
        name: 'user-list', path: 'userlist', mode: DtiMode.QString,
        route: routeUser,
        validate(p) {

            if (!p.order) {
                throw new Error('order is no defined')
            }
        },

    });
    export const customerCreate = DtiAction.define<CustomerCreateReslt, CustomerPayload>({
        name: 'customer-create', mode: DtiMode.BFrom,
        route: routeCustomer,
        validate(p) {
            if (!p.name) {
                throw new Error('name is requared');
            }
            if (!p.code) {
                throw new Error('code is requared');
            }
        },
    });

    export const customerList = DtiAction.define<string[], CustomerPayload>({
        name: 'list', mode: DtiMode.QJson,
        route: routeCustomer,
        validate(p) {
            if (!p.name) {
                throw new Error('name is requared');
            }
            if (!p.code) {
                throw new Error('name is requared');
            }
        },
    });

    export const raw1: IRawActionBuilder = (route) => {


        route.get('/raw1', (req: any, res: any, next: any) => {

            res.json({
                ...req.query,
                d: req.query
            })

        })

    }



}