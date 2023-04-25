import { api } from "./client.api";
import { Test01Dti } from "./dti";
import * as assert from 'assert';


describe("Param test", () => {
    it("qparam", async () => {
        // create a mock for the User class
        let resp = await api.dti(Test01Dti.userList)
            .call({ order: 'test' });



        // assert that the user id is 1
        assert.equal('test', resp.order)
    });

    it("qjson", async () => {
        // create a mock for the User class
        let resp = await api.dti(Test01Dti.customerList)
            .call({ code: '22', name: '33' });



        // assert that the user id is 1
        assert.deepEqual(['22', '33'], resp)
    });

    it("bjson", async () => {
        // create a mock for the User class
        let { id, data } = await api.dti(Test01Dti.userCreate)
            .call({ age: 34, name: 'farcek' });



        // assert that the user id is 1
        assert.deepEqual({ id: 'newid', data: { age: 34, name: 'farcek' } }, { id, data })
    });
    it("bform", async () => {
        // create a mock for the User class
        let { flag, data } = await api.dti(Test01Dti.customerCreate)
            .call({ code: '55', name: '99' });



        // assert that the user id is 1
        assert.deepEqual({ flag: true, data: ['55', '99'] }, { flag, data })
    });
});