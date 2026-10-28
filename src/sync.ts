import { enumerableKeysOf, isPlainObject, type UnknownRecord } from "./util.ts";

/**
 * A function called for each object entry with the current level of iteration.
 *
 * @param key The key for this entry.
 * @param value The value for this entry.
 * @param current The object at the current level of iteration depth.
 */
export type ForEachObjectCallback = (key: string | symbol, value: unknown, current: UnknownRecord) => void;

export const sync = (object: UnknownRecord, callback: ForEachObjectCallback, seen = new WeakSet()) => {
	for (const key of enumerableKeysOf(object)) {
		const value = object[key];
		callback(key, value, object);

		if (isPlainObject(value)) {
			if (object === value || seen.has(value)) {
				continue;
			}

			seen.add(value);
			sync(value, callback, seen);
		}

		if (!Array.isArray(value)) {
			continue;
		}

		const traverseArray = (array: unknown[]) => {
			if (seen.has(array)) {
				return;
			}

			seen.add(array);

			for (const element of array) {
				if (object !== element && isPlainObject(element) && !seen.has(element)) {
					sync(element, callback, seen);
				} else if (Array.isArray(element)) {
					traverseArray(element);
				}
			}
		};

		traverseArray(value);
	}
};
