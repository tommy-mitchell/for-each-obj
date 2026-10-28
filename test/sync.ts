/* eslint-disable perfectionist/sort-objects, perfectionist/sort-object-types -- order matters */
import test from "ava";
import * as tq from "test-quadruple";
import { forEachObject, type ForEachObjectCallback } from "#src/index.ts";

const FIXTURE = {
	one: 1,
	object: { two: 2, three: 3 },
	array: [{ four: 4 }, 5, [{ six: 6 }]],
	seven: 7,
} as const;

const DOUBLE_CALLBACK = ((key, value, object) => {
	if (typeof value !== "number") {
		return;
	}

	object[key] = value * 2;
}) satisfies ForEachObjectCallback;

const forEachSpy = (object: Record<string, unknown>, spy: ForEachObjectCallback = tq.spy()) => {
	forEachObject(object, spy);
	return tq.explain(spy).calls.map(c => c.arguments);
};

test("main", t => {
	const fixture = structuredClone(FIXTURE);
	const args = forEachSpy(fixture);

	t.deepEqual(args, [
		["one", 1, fixture],
		["object", { two: 2, three: 3 }, fixture],
		["two", 2, fixture.object],
		["three", 3, fixture.object],
		["array", [{ four: 4 }, 5, [{ six: 6 }]], fixture],
		["four", 4, fixture.array[0]],
		["six", 6, fixture.array[2][0]],
		["seven", 7, fixture],
	]);
});

test("with modifications", t => {
	const fixture = structuredClone(FIXTURE);
	forEachObject(fixture, DOUBLE_CALLBACK);

	t.deepEqual(fixture, {
		one: 2,
		object: { two: 4, three: 6 },
		array: [{ four: 8 }, 5, [{ six: 12 }]],
		seven: 14,
	});
});

test("handles circular references", t => {
	type FixtureArray = [Fixture | FixtureArray | { one: number; }];
	type Fixture = {
		array: FixtureArray;
		two: number;
		array2: FixtureArray;
		circular?: Fixture;
	};

	const fixtureArray: FixtureArray = [{ one: 1 }];
	fixtureArray.push(fixtureArray);
	const fixture: Fixture = { array: fixtureArray, two: 2, array2: fixtureArray };
	fixture.circular = fixture;
	fixture.array.push(fixture);

	const args = forEachSpy(fixture, tq.spy(DOUBLE_CALLBACK));

	t.deepEqual(fixture, {
		array: [{ one: 2 }, fixtureArray, fixture],
		two: 4,
		array2: [{ one: 2 }, fixtureArray, fixture],
		circular: fixture,
	});

	const keys = args.map(arg => arg[0]);
	t.deepEqual(keys, ["array", "one", "two", "array2", "circular"]);
});

test("works with symbols", t => {
	const outerSymbol = Symbol("outer");
	const innerSymbol = Symbol("inner");
	const fixture = {
		regular: 1,
		nested: {
			regularNested: 2,
			[innerSymbol]: 3,
		},
		[outerSymbol]: 4,
	};

	const args = forEachSpy(fixture);

	t.deepEqual(args, [
		["regular", 1, fixture],
		["nested", fixture.nested, fixture],
		["regularNested", 2, fixture.nested],
		[innerSymbol, 3, fixture.nested],
		[outerSymbol, 4, fixture],
	]);
});

test("ignores non-enumerable keys", t => {
	const fixture = Object.defineProperty({ one: 1 }, "hidden", { value: 2, enumerable: false });
	const args = forEachSpy(fixture);

	t.deepEqual(args, [["one", 1, fixture]]);
});

test("ignores non-plain objects", t => {
	const date = new Date();
	const regex = /test/v;
	const error = new Error("test");
	const map = new Map([["key", "value"]]);
	const set = new Set([1, 2, 3]);
	const promise = Promise.resolve(42);
	const buffer = new ArrayBuffer(8);
	const uint8Array = new Uint8Array(4);
	const instance = new (class {
		foo = "bar";
	})();

	const base = { date, regex, error, map, set, promise, buffer, uint8Array, instance };
	const fixture = { ...base, one: 1 };
	forEachObject(fixture, DOUBLE_CALLBACK);

	t.deepEqual(fixture, { ...base, one: 2 });
});
