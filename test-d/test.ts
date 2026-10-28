import * as tsd from "tsd";
import {
	forEachObject,
	forEachObjectAsync,
	type ForEachObjectAsyncCallback,
	type ForEachObjectCallback,
} from "../src/index.ts";

const callback = ((key, value, current) => {
	tsd.expectType<string | symbol>(key);
	tsd.expectType<unknown>(value);
	tsd.expectType<Record<PropertyKey, unknown>>(current);
	tsd.expectAssignable<Record<string, unknown>>(current);
}) satisfies ForEachObjectCallback;

const asyncCallback = (async (key, value, current) => {
	tsd.expectType<string | symbol>(key);
	tsd.expectType<unknown>(value);
	tsd.expectType<Record<PropertyKey, unknown>>(current);
	tsd.expectAssignable<Record<string, unknown>>(current);
}) satisfies ForEachObjectAsyncCallback;

tsd.expectType<void>(forEachObject({ string: "value", symbol: 1n }, callback));
tsd.expectType<Promise<void>>(forEachObjectAsync({ nested: { value: true } }, asyncCallback));
