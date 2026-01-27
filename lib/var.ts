export const varObj = {
    BW_DATA: "/home/turbo/web-services/new-mexico/boltwood",
    PTZ: "/home/turbo/web-services/new-mexico/PTZ",
    AXIS_CAM: {
        T1: "/home/turbo/web-services/new-mexico/north-enclosure/axis-cam",
        T2: "/home/turbo/web-services/new-mexico/central-enclosure/axis-cam",
        T3: "/home/turbo/web-services/new-mexico/south-enclosure/axis-cam",
    },
    // enabled: true,
    // stations: ["NM01", "NM02"],
    // thresholds: [1.2, 2.4, 3.8],
} as const;

// Overloads
export function getVar<K extends keyof typeof varObj>(key: K): typeof varObj[K];
export function getVar(key: string): any;

// Implementation
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