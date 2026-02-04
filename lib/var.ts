export const varObj = {
    BW_DATA: "/home/turbo/web-services/new-mexico/boltwood",
    PTZ: "/home/turbo/web-services/new-mexico/PTZ",
    AXIS_CAM: {
        T3: "/home/turbo/web-services/new-mexico/north-enclosure/axis-cam",
        T1: "/home/turbo/web-services/new-mexico/central-enclosure/axis-cam",
        T2: "/home/turbo/web-services/new-mexico/south-enclosure/axis-cam",
    },
    ENC_DATA: {
        T1: "/home/turbo/web-services/new-mexico/north-enclosure/data",
        T2: '/home/turbo/web-services/new-mexico/central-enclosure/data',
        T3: '/home/turbo/web-services/new-mexico/south-enclosure/data',
    },
} as const;

// Overloads
export function getVar<K extends keyof typeof varObj>(key: K): typeof varObj[K];
export function getVar(key: string): any;

export function getVar(key: string): any {
    const parts = key.split(".");
    let result: any = varObj;

    for (const part of parts) {
        if (result == null || !(part in result)) {
            throw new Error(`Missing config key: ${key}`);
        }
        result = result[part];
    }

    return result;
}