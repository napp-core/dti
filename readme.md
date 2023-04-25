DTI - Data transfare interface




dti define;  
---

``` typescript
// define type.

export interface IUserItem {
    id: string;
    name: string;
    age: number;
}
export interface IUserListParam {
    order: string;
}
export interface IUserListResult {
    items: IUserItem[]
}


// route define. 
export const routeWeb = DtiRoute.factory("web");
export const routeUser = DtiRoute.factory("user", {
    path: 'user-route'
});

routeWeb
    .regChildroute(routeUser);



// action define.
export const dtiUserList = DtiAction.define<IUserListResult, IUserListParam>({
    name: 'user-list', path: 'userlist'
    route: routeUser,
    validate(p) {

        if (!p.order) {
            throw new Error('order is no defined')
        }
    },
});

```


server side;  
------



``` typescript

// define server action
const actionUserList = DtiServerAction.factory(dtiUserList, {
    async action(param) {

        console.log(param) // param is typeof IUserListParam

        // return is typeof IUserListResult
        return {
            items: [{
                id: '1',
                age: 2,
                name: '3' 
            }]
        }
    },
})

// init server
const server = new DtiServer(routeWeb);

// register server actions
server.register(actionUserList);


// express setup
const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/api', DtiServer.setup(server, {
    factoryExpressRouter: () => express.Router(),
    factoryBodyparseJson: () => express.json(),
    factoryBodyparseUrlencode: () => express.urlencoded(),
}))

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

```



client site

``` typescript

// define api 
export const api = new DtiClientBuilder()
    .baseUrl(routeWeb, 'http://localhost:3000/api')
    .build()


// using
let resp:IUserListResult = await api.dti(dtiUserList)
    .call({ order: 'name' });

```