export interface IDtiError {
    code: string;
    message: string;
}
export class DtiError extends Error implements IDtiError {

    constructor(public code: string, message: string) {
        super(message)
        this.name = 'DtiError';
        Object.setPrototypeOf(this, DtiError.prototype);
    }


    toPlanObject() {
        return {
            code: this.code,
            message: this.message
        }
    }

    toJson() {
        return this.toPlanObject()
    }

    static fromCode(code: string, obj: any) {
        if (obj) {

            if (obj instanceof DtiError) {
                return new DtiError(code, obj.message)
            }
            if (obj instanceof Error) {
                return new DtiError(code, obj.message)
            }

            if (obj.message) {
                return new DtiError(code, '' + obj.message)
            }
            if (obj.error) {
                return new DtiError(code, '' + obj.error)
            }

            return new DtiError(code, '' + obj)
        }

        return new DtiError(code, "undefined error")
    }
    static from(obj: any) {
        if (obj) {
            if (obj instanceof DtiError) {
                return obj;
            }
            if (obj instanceof Error) {

                if ('code' in obj) {
                    return new DtiError(`${(obj as any).code}`, `${(obj as any).message}`)
                }
                return new DtiError(obj.name, obj.message)
            }

            if (obj.code && obj.message) {
                return new DtiError('' + obj.code, '' + obj.message)
            }
            if (obj.code && obj.error) {
                return new DtiError('' + obj.code, '' + obj.error)
            }
            if (obj.name && obj.message) {
                return new DtiError('' + obj.name, '' + obj.message)
            }
            if (obj.name && obj.error) {
                return new DtiError('' + obj.name, '' + obj.error)
            }

            if (obj.code) {
                return new DtiError('' + obj.code, 'error code=' + obj.code)
            }
            if (obj.name) {
                return new DtiError('' + obj.name, 'error code=' + obj.name)
            }

            if (obj.message) {
                return new DtiError('nocode', '' + obj.message)
            }
            if (obj.error) {
                return new DtiError('nocode', '' + obj.error)
            }

            return new DtiErrorUnknown('unknown error; error=' + obj)
        }

        return new DtiErrorUnknown("undefined error")
    }
}

export class DtiErrorUnknown extends DtiError {
    constructor(message: string) {
        super('unknown', message);
        this.name = 'DtiErrorUnknown';
        Object.setPrototypeOf(this, DtiErrorUnknown.prototype);
    }
}