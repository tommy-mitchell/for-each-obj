import { async, type ForEachObjectAsyncCallback } from "./async.ts";
import { type ForEachObjectCallback, sync } from "./sync.ts";
import type { UnknownRecord } from "./util.ts";

export type { ForEachObjectAsyncCallback } from "./async.ts";
export type { ForEachObjectCallback } from "./sync.ts";
export type { UnknownRecord } from "./util.ts";

/**
 * Deeply traverses an object's entries via any nested objects or arrays. Handles circular references and symbol keys.
 *
 * @param object The source object to traverse.
 * @param callback A function called for each object entry with the current level of iteration.
 *
 * @example
 * import { forEachObject } from "for-each-obj";
 *
 * forEachObject({
 *     one: 1,
 *     object: { two: 2, three: 3 },
 *     array: [{ four: 4 }, 5, [{ six: 6 }, 7]],
 *     eight: 8,
 * }, (key, value, current) => {
 *     if (typeof value === "number") {
 *         current[key] = value * 2;
 *     }
 * });
 *
 * // {
 * //   one: 2,
 * //   object: { two: 4, three: 6 },
 * //   array: [{ four: 8 }, 5, [{ six: 12 }, 7]],
 * //   eight: 16,
 * // }
 */
export function forEachObject(object: UnknownRecord, callback: ForEachObjectCallback): void {
	sync(object, callback);
}

/**
 * Deeply traverses an object's entries in parallel via any nested objects or arrays. Handles circular references and symbol keys.
 *
 * @param object The source object to traverse.
 * @param callback A function called for each object entry with the current level of iteration.
 *
 * @example
 * import { forEachObjectAsync } from "for-each-obj";
 * import ky from "ky";
 *
 * const context = {};
 * await forEachObjectAsync({
 *     user: "/api/user",
 *     settings: {
 *         theme: "/api/settings/theme"
 *     }
 * }, async (key, value) => {
 *     if (typeof value === "string") {
 *         context[key] = await ky.get(value);
 *     }
 * });
 *
 * // {
 * //   user: {…},
 * //   theme: {…},
 * // }
 */
export async function forEachObjectAsync(object: UnknownRecord, callback: ForEachObjectAsyncCallback): Promise<void> {
	await async(object, callback);
}
