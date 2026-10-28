/* eslint-disable perfectionist/sort-objects, perfectionist/sort-object-types -- order matters */
import test, { type ExecutionContext } from "ava";
import * as tq from "test-quadruple";
import { forEachObjectAsync, type ForEachObjectAsyncCallback } from "#src/index.ts";

const FIXTURE = {
	one: 1,
	object: { two: 2, three: 3 },
	array: [{ four: 4 }, 5, [{ six: 6 }]],
	seven: 7,
} as const;

const DOUBLE_CALLBACK = (async (key, value, object) => {
	if (typeof value !== "number") {
		return;
	}

	object[key] = value * 2;
}) satisfies ForEachObjectAsyncCallback;

const forEachSpy = async (
	object: Record<string, unknown>,
	spy: ForEachObjectAsyncCallback = tq.spy(),
): Promise<KeyedArgs[]> => {
	await forEachObjectAsync(object, spy);
	return tq.explain(spy).calls.map(c => c.arguments) as KeyedArgs[];
};

type KeyedArgs = [string | symbol, ...unknown[]];
const sort = ([a]: KeyedArgs, [b]: KeyedArgs) => a.toString().localeCompare(b.toString());

// Have to use unordered since iteration is done in parallel
const unorderedEqual = (t: ExecutionContext, a: KeyedArgs[], b: KeyedArgs[]) => {
	t.deepEqual(a.toSorted(sort), b.toSorted(sort));
};

test("main", async t => {
	const fixture = structuredClone(FIXTURE);
	const args = await forEachSpy(fixture);

	unorderedEqual(t, args, [
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

test("with modifications", async t => {
	const fixture = structuredClone(FIXTURE);
	await forEachObjectAsync(fixture, DOUBLE_CALLBACK);

	t.deepEqual(fixture, {
		one: 2,
		object: { two: 4, three: 6 },
		array: [{ four: 8 }, 5, [{ six: 12 }]],
		seven: 14,
	});
});

test("handles circular references", async t => {
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

	const args = await forEachSpy(fixture, tq.spy(DOUBLE_CALLBACK));

	t.deepEqual(fixture, {
		array: [{ one: 2 }, fixtureArray, fixture],
		two: 4,
		array2: [{ one: 2 }, fixtureArray, fixture],
		circular: fixture,
	});

	const keys = args.map(arg => arg[0]);
	t.deepEqual(keys.toSorted(), ["array", "one", "two", "array2", "circular"].toSorted()); // eslint-disable-line @typescript-eslint/require-array-sort-compare
});

test("works with symbols", async t => {
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

	const args = await forEachSpy(fixture);

	unorderedEqual(t, args, [
		["regular", 1, fixture],
		["nested", fixture.nested, fixture],
		["regularNested", 2, fixture.nested],
		[innerSymbol, 3, fixture.nested],
		[outerSymbol, 4, fixture],
	]);
});

test("ignores non-enumerable keys", async t => {
	const fixture = Object.defineProperty({ one: 1 }, "hidden", { value: 2, enumerable: false });
	const args = await forEachSpy(fixture);

	t.deepEqual(args, [["one", 1, fixture]]);
});

test("ignores non-plain objects", async t => {
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
	await forEachObjectAsync(fixture, DOUBLE_CALLBACK);

	t.deepEqual(fixture, { ...base, one: 2 });
});
