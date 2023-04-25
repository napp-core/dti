import { api } from "./client.api";
import { Test01Dti } from "./dti";
import * as assert from 'assert';
import fetch from 'cross-fetch';


describe("Raw action test", () => {
    it("raw1", async () => {
        let url = api.buildUrl(Test01Dti.routeUser, '/raw1');
        let resp = await fetch(url + "?a=1&b=2");
        let result = await resp.json();

        assert.deepEqual({ a: '1', b: '2', d: { a: '1', b: '2' } }, result)
    });
});