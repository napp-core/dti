import { DtiAction } from "../core";
import { api } from "./client.api";
import { Test01Dti } from "./dti";
import * as assert from 'assert';
import fetch from 'cross-fetch';

interface IBundlerAction<RESULT, PARAM> {
    (dto: DtiAction<RESULT, RESULT>): { call: (param: PARAM) => Promise<RESULT> }
}

describe("Bundle test", () => {



    it("test1", async () => {





        let [createResult, listResult] = await api.bundle(
            api.dti(Test01Dti.customerCreate).bundler({ code: '1', name: '3' }),
            api.dti(Test01Dti.customerList).bundler({ code: '2', name: '4' }),
        );

        assert.deepEqual({ flag: true, data: ['1', '3'] }, createResult)
        assert.deepEqual(['2', '4'], listResult)

    });
});