import { DtiRoute } from "@napp/dti-core";
import { DtiClientBuilder } from "./builder";

export class DtiClientRoute {
    constructor(private meta: DtiRoute, private builder: DtiClientBuilder) {

    }

    buildUrl(action: string) {
        let base = this.builder.getBaseUrl(this.meta.getFullname()) || '';
        return base + this.meta.getPaths().join('') + action;
    }
}