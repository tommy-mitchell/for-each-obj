import { runInNewContext } from "node:vm";
import test from "ava";
import { enumerableKeysOf, isPlainObject } from "#src/util.ts";

function Foo(this: { x?: unknown; }, x?: unknown) { // eslint-disable-line @typescript-eslint/naming-convention
	this.x = x;
}

class Bar {
	x?: unknown;

	constructor(x?: unknown) {
		this.x = x;
	}
}

function ObjectConstructor() {/**/} // eslint-disable-line @typescript-eslint/naming-convention
ObjectConstructor.prototype.constructor = Object; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

// @ts-expect-error -- new function
const fooWithConstructor = new Foo(); // eslint-disable-line @typescript-eslint/no-unsafe-assignment
fooWithConstructor.constructor = Object; // eslint-disable-line @typescript-eslint/no-unsafe-member-access

// Stop TypeScript complaining about unused
[Bar, runInNewContext]; // eslint-disable-line @typescript-eslint/no-unused-expressions

for (
	const fixture of [
		"{}",
		"{ foo: true }",
		"{ constructor: Foo }",
		"{ valueOf: 0 }",
		"Object.create(null)",
		"new Object()",
		"runInNewContext(\"({})\")",
	]
) {
	test(`isPlainObject | ${fixture}`, t => {
		t.true(isPlainObject(eval(`(${fixture})`))); // eslint-disable-line no-eval
	});
}

for (
	const fixture of [
		"[\"foo\", \"bar\"]",
		"new Foo(1)",
		"Reflect.construct(Foo, [1])",
		"new Bar(2)",
		"Math",
		"JSON",
		"Atomics",
		"Error",
		"() => {}",
		"/./",
		"null",
		"undefined",
		"NaN",
		"\"\"",
		"0",
		"false",
		"new ObjectConstructor()",
		"Object.create({})",
		"(function() { return arguments })()",
		"fooWithConstructor",
	]
) {
	test(`isPlainObject | ${fixture}`, t => {
		t.false(isPlainObject(eval(`(${fixture})`))); // eslint-disable-line no-eval
	});
}

test("enumerableKeysOf", t => {
	const symbolFoo = Symbol("foo");
	const symbolBar = Symbol.for("bar");

	const fixture = Object.defineProperty(
		{ one: 1, [symbolFoo]: 2, [symbolBar]: 3, [Symbol.toStringTag]: "Fixture" }, // eslint-disable-line perfectionist/sort-objects
		"hidden",
		{ enumerable: false, value: "teehee" },
	);

	t.deepEqual(enumerableKeysOf(fixture), ["one", symbolFoo, symbolBar, Symbol.toStringTag]);
});
