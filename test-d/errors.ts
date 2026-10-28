import * as tsd from "tsd";
import {
	forEachObject,
	forEachObjectAsync,
	type ForEachObjectAsyncCallback,
	type ForEachObjectCallback,
} from "../src/index.ts";

declare const callback: ForEachObjectCallback;
declare const asyncCallback: ForEachObjectAsyncCallback;

// Invalid input types
tsd.expectError(forEachObject("not an object", callback));
tsd.expectError(forEachObjectAsync(42, asyncCallback));

// Invalid callback types
tsd.expectError(forEachObject({}, undefined));
tsd.expectError(forEachObjectAsync({}, null));
tsd.expectError(forEachObject({}, (_key: number) => {}));
tsd.expectError(forEachObjectAsync({}, (_key: number) => {}));
