# for-each-obj

Deeply traverse an object's keys and values.

## Install

```sh
npm install for-each-obj
```

<details>
<summary>Other package managers</summary>
<p>

```sh
yarn add for-each-obj
```

```sh
pnpm add for-each-obj
```

</p>
</details>

## Usage

```ts
import { forEachObject } from "for-each-obj";

forEachObject({
    one: 1,
    object: { two: 2, three: 3 },
    array: [{ four: 4 }, 5, [{ six: 6 }, 7]],
    eight: 8,
}, (key, value, current) => {
    if (typeof value === "number") {
        current[key] = value * 2;
    }
});

// {
//   one: 2,
//   object: { two: 4, three: 6 },
//   array: [{ four: 8 }, 5, [{ six: 12 }, 7]],
//   eight: 16,
// }
```

```ts
import { forEachObjectAsync } from "for-each-obj";
import ky from "ky";

const context = {};
await forEachObjectAsync({
    user: "/api/user",
    settings: {
        theme: "/api/settings/theme",
    }
}, async (key, value) => {
    if (typeof value === "string") {
        context[key] = await ky.get(value);
    }
});

// {
//   user: {…},
//   theme: {…},
// }
```

## API

### forEachObject(object, callback)

Deeply traverses an object's entries via any nested objects or arrays. Handles circular references and symbol keys.

### forEachObjectAsync(object, callback)

Same as above, but iterates entries in parallel.

#### object

Type: `object`

The source object to traverse.

#### callback

Type: `(key: string | symbol, value: unknown, current: object) => void`

A function called for each object entry with the current level of iteration.

## Related

- [map-obj](https://github.com/sindresorhus/map-obj) - Map object keys and values into a new object.
- [filter-obj](https://github.com/sindresorhus/filter-obj) - Filter object keys and values into a new object.
