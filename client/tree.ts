
export interface ITreeNamer<T> {
    name: string;
    parent?: string;
    value?: T;

    childs?: ITreeNamer<T>[]
}
export class TreeNamer<T> {

    constructor(private name: string, private parent?: TreeNamer<T>) {

    }
    private value?: T;

    private childs?: Record<string, TreeNamer<T>>;


    set(name: string, value: T) {
        let names = (name || '').split('.').filter(it => !!it);


        let curr: TreeNamer<T> = this;

        while (names.length > 0) {
            let name: string = names.shift() || '';
            curr = curr.getOrCreate(name);
        }

        curr.value = value;

        return this;
    }

    findEqual(name: string) {
        let names = (name || '').split('.').filter(it => !!it);

        let curr: TreeNamer<T> = this;
        while (names.length > 0) {
            let name: string = names.shift() || '';

            if (curr.childs) {
                if (name in curr.childs) {
                    curr = curr.childs[name];
                } else {
                    return undefined
                }
            }
        }

        return curr;


    }
    findParent(name: string) {
        let names = (name || '').split('.').filter(it => !!it);

        let curr: TreeNamer<T> = this;
        while (names.length > 0) {
            let name: string = names.shift() || '';

            if (curr.childs) {
                if (name in curr.childs) {
                    curr = curr.childs[name];
                } else {
                    return curr
                }
            }
        }

        return curr;
    }

    getValue(): T | undefined {
        if (this.value) {
            return this.value;
        }
        if (this.parent) {
            return this.parent.getValue();
        }

        return undefined
    }

    private getOrCreate(name: string) {
        this.childs = this.childs || {};

        if (name in this.childs) {
            return this.childs[name]
        }

        return this.childs[name] = new TreeNamer<T>(name, this);
    }

    private toObj(): ITreeNamer<T> {

        let obj: ITreeNamer<T> = {
            name: this.name,
            parent: this.parent?.name,
            value: this.value
        }

        if (this.childs) {
            obj.childs = [];
            for (let p of Object.keys(this.childs)) {
                let it = this.childs[p];
                if (it && it.name && typeof it.toObj === 'function' && typeof it.getOrCreate === 'function') {
                    obj.childs.push(it.toObj())
                }

            }
        }

        return obj;
    }

    print() {
        return JSON.stringify(this.toObj(), null, 4);
    }
}

