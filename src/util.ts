export type UnknownRecord = Record<PropertyKey, unknown>;

export const isPlainObject = (
	object: unknown,
	prototype = () => Object.getPrototypeOf(object) as UnknownRecord,
): object is UnknownRecord => (
	typeof object === "object" && object !== null
	&& (prototype() === null || prototype() === Object.prototype || Object.getPrototypeOf(prototype()) === null)
	&& !Object.hasOwn(object, Symbol.toStringTag) && !Object.hasOwn(object, Symbol.iterator)
);

export const enumerableKeysOf = (object: UnknownRecord) => (
	Reflect.ownKeys(object).filter(key => Object.propertyIsEnumerable.call(object, key))
);
