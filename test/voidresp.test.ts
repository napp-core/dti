import { api } from "./client.api";
import { Test01Dti } from "./dti";
import * as assert from 'assert';


describe("void resp", () => {
    it("void1", async () => {
        // create a mock for the User class
        let resp = await api.dti(Test01Dti.customerVoid)
            .call({ code: '1', name: '2' });

        // assert that the user id is 1
        assert.equal(void 0, resp, ' void resp ')
    });


});