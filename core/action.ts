import { DtiMode } from "./common";
import { DtiRoute } from "./route";

interface ODtiAction<RESULT, PARAM> {
    name: string;
    route: DtiRoute;

    mode?: DtiMode;
    path?: string;
    validate?: (p: PARAM) => void
}
export class DtiAction<RESULT, PARAM>{


    private constructor(private opt: ODtiAction<RESULT, PARAM>) {
        opt.route.regAction(this);
    }

    getName(): string {
        return this.opt.name;
    }
    getRoute(): DtiRoute {
        return this.opt.route;
    }
    getMode(): DtiMode {
        return this.opt.mode || DtiMode.QString;
    }
    getPath(): string {
        return '/' + (this.opt.path || this.getName());
    }

    getFullname() {
        return `${this.getRoute().getFullname()}.${this.getName()}`;
    }



    validate(p: PARAM) {
        if (this.opt.validate) {
            this.opt.validate(p);
        }
    }

    static define<RESULT, PARAM>(opt: ODtiAction<RESULT, PARAM>) {
        return new DtiAction<RESULT, PARAM>(opt);
    }
}
