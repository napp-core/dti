const key = Symbol.for('DtiRawResponse_key')
export class DtiRawResponse {
    private [key] = key;

    static is(obj: any) {
        if (obj instanceof DtiRawResponse && obj[key] === key) {
            return true
        }
        return false
    }
}