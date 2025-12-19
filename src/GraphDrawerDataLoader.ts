import { FunctionsStorage } from "./FunctionsStorageContext";

export interface GraphDrawerFunctionDataV1 {
    src: string;
    color: number;
    enabled?: boolean;
    //type?: string;
}

export interface GraphDrawerDataV1 {
    version: 1;
    functions: GraphDrawerFunctionDataV1[];
}

export type GraphDrawerFunctionDataVx = GraphDrawerFunctionDataV1;
export type GraphDrawerContextDataVx = GraphDrawerDataV1;

export type GraphDrawerFunctionData = GraphDrawerFunctionDataV1;
export type GraphDrawerData = GraphDrawerDataV1;

export class GraphDrawerDataLoader {
    static validateData(o: any): GraphDrawerData {
        if (!(o && typeof o === "object")) {
            throw new Error();
        }
        switch (o.version) {
            case 1: {
                if (Array.isArray(o.functions)) {
                    for (const f of o.functions) {
                        if (!(f && typeof f === "object"
                            && typeof f.src === "string" && typeof f.color === "number")) {
                            throw new Error();
                        }
                    }
                }
                return o as GraphDrawerData;
            }
        }
        throw new Error();
    }

    static getFromLocalStorage(key: string): GraphDrawerData {
        const src = localStorage.getItem(key);
        if (!src) {
            throw new Error();
        }
        return this.validateData(JSON.parse(src));
    }

    static getFromUrl(data: string): GraphDrawerData {
        return this.validateData(JSON.parse(decodeURIComponent(data)));
    }

    static async getFromRemoteApi(url: string): Promise<GraphDrawerData> {
        const r = await fetch(url);
        return this.validateData(await r.json());
    }

    static tryGetLegacyAndMigrate() {
        const oldDataSrc = localStorage.getItem("functions data");
        if (oldDataSrc) {
            try {
                const oldData = JSON.parse(oldDataSrc);
                if (Array.isArray(oldData) && oldData.every(fd => fd && typeof fd === "object" && typeof fd.src === "string")) {
                    const data: GraphDrawerData = {
                        version: 1,
                        functions: oldData.map(({ src, color }) => ({ src, color: color || "black" })),
                    };
                    localStorage.removeItem("functions data");
                    this.writeUrl(data);
                    return data;
                }
            } catch (e) {
                console.warn(e);
            }
        }
    }

    static getAuto() {
        const sp = new URLSearchParams(location.search);
        switch (sp.get("type")) {
            case "url": {
                const data = sp.get("data");
                if (!data) {
                    throw new Error();
                }
                return this.getFromUrl(data);
            }
            case "ls": {
                const key = sp.get("key");
                if (!key) {
                    throw new Error();
                }
                return this.getFromLocalStorage(key);
            }
            case "eapi": {
                const url = sp.get("url");
                if (!url) {
                    throw new Error();
                }
                return this.getFromRemoteApi(url);
            }
            default:
                return this.tryGetLegacyAndMigrate();
        }
    }

    static data2context(data: GraphDrawerContextDataVx, context = new FunctionsStorage()) {
        data = this.validateData(data);
        context.clear(false);
        for (const fd of data.functions) {
            context.state[context.nextId()] = {
                func: fd.src,
                color: fd.color & 0xffffff,
            };
        }
    }

    static context2data(context: FunctionsStorage): GraphDrawerData {
        return {
            version: 1,
            functions: Object.values(context.state).map(fd => ({
                src: fd.func,
                color: fd.color & 0xffffff,
            }))
        };
    }

    static setContextSave(context: FunctionsStorage) {
        const sp = new URLSearchParams(location.search);
        let cb: ((ctx: FunctionsStorage) => void) | undefined;
        switch (sp.get("type")) {
            case "url":
                cb = (context) => this.writeUrl(this.context2data(context));
                break;
            case "ls":
                const key = sp.get("key");
                if (!key) {
                    throw new Error();
                }
                cb = (context) => this.writeLocalStorage(this.context2data(context), key);
                break;
        }
        context.setSave(cb);
        if (cb) {
            return context.onUpdate(context => context.trySave());
        }
    }

    static getDummy(): GraphDrawerData {
        return {
            version: 1,
            functions: [],
        };
    }

    static writeUrl(context: GraphDrawerData) {
        const data = encodeURIComponent(JSON.stringify(context));
        const url = new URL(location.toString());
        url.searchParams.set("type", "url");
        url.searchParams.set("data", data);
        history.replaceState(context, data, url.toString());
    }

    static writeLocalStorage(context: GraphDrawerData, key: string) {
        const url = new URL(location.toString());
        url.searchParams.set("type", "ls");
        url.searchParams.set("key", key);
        localStorage.setItem(key, JSON.stringify(context));
        history.replaceState(context, key, url.toString());
    }
}
