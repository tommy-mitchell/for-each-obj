import { enumerableKeysOf, isPlainObject, type UnknownRecord } from "./util.ts";

/**
 * A function called for each object entry with the current level of iteration.
 *
 * @param key The key for this entry.
 * @param value The value for this entry.
 * @param current The object at the current level of iteration depth.
 */
export type ForEachObjectAsyncCallback = (
	key: string | symbol,
	value: unknown,
	current: UnknownRecord,
) => Promise<void>;

export const async = async (
	object: UnknownRecord,
	callback: ForEachObjectAsyncCallback,
	seen = new WeakSet(),
) => (Promise.all(
	enumerableKeysOf(object).map(async (key) => {
		const value = object[key];
		await callback(key, value, object);

		if (isPlainObject(value)) {
			if (object === value || seen.has(value)) {
				return;
			}

			seen.add(value);
			await async(value, callback, seen);
		}

		if (!Array.isArray(value)) {
			return;
		}

		const traverseArray = async (array: unknown[]) => {
			if (seen.has(array)) {
				return;
			}

			seen.add(array);

			await Promise.all(array.map(async (element) => {
				if (object !== element && isPlainObject(element) && !seen.has(element)) {
					await async(element, callback, seen);
				} else if (Array.isArray(element)) {
					await traverseArray(element);
				}
			}));
		};

		await traverseArray(value);
	}),
));
