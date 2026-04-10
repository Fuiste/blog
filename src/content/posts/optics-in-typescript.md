---
title: Optics in TypeScript
description: Lenses, prisms, and composable accessors for immutable data, explained from scratch with a small library as the running example.
pubDate: 2026-04-09
tags:
  - Functional Programming
  - TypeScript
  - Software Design
featured: true
draft: false
---

The previous post covered what functional programming _is_ — pure code, functions as values, composition. This one is about a specific tool from that world that I think deserves more attention in TypeScript: optics.

Optics are composable accessors. They let you read from and write to nested immutable data without losing your mind. If you have ever written a spread chain like `{ ...state, user: { ...state.user, address: { ...state.user.address, zip: newZip } } }` and thought "there has to be a better way," optics are that better way.

I built a small library called [`@fuiste/optics`](https://github.com/Fuiste/optics) to scratch this itch. The rest of this post uses it as the running example, but the concepts are general.

## The Problem

Immutability is good. We covered _why_ in the first post — fewer side effects, referential transparency, less state to track. But immutability has a practical cost: updating nested structures is verbose and error-prone.

Consider a simple domain:

```ts
type Address = {
  street: string;
  zip: string;
};

type Person = {
  name: string;
  age: number;
  address?: Address;
};
```

Updating the zip code of a `Person` immutably requires touching every layer:

```ts
const updateZip = (person: Person, zip: string): Person => ({
  ...person,
  address: person.address
    ? { ...person.address, zip }
    : undefined,
});
```

This is two levels deep and already annoying. Real application state goes five, six, seven levels. The spread chains get long, the optional checks multiply, and the types get harder to follow. Optics solve this by giving each "step" into a structure its own composable unit.

## Lenses

A **lens** is the simplest optic. It focuses on exactly one value inside a structure, with a total `get` (always succeeds) and an immutable `set`.

```ts
import { Lens } from "@fuiste/optics";

const name = Lens<Person>().prop("name");

name.get({ name: "Alice", age: 30 });
// "Alice"

name.set("Bob")({ name: "Alice", age: 30 });
// { name: "Bob", age: 30 }
```

Two things worth noting here. First, `set` returns a function — it takes the new value and produces an updater. This is curried by design, which makes it composable (more on this shortly). Second, `set` also accepts a function:

```ts
name.set((n) => n.toUpperCase())({ name: "Alice", age: 30 });
// { name: "ALICE", age: 30 }
```

This means a lens is both a getter and an updater. The original structure is never mutated.

If you squint, a lens is really just a pair of functions — `get: (s: S) => A` and `set: (a: A) => (s: S) => S` — bundled together with a tag so the library knows what it is. That is literally the implementation.

## Prisms

A **prism** is a lens that might fail. Its `get` returns `A | undefined` instead of `A`. This is useful for optional fields, union branches, or any case where the value you want might not be there.

```ts
import { Prism } from "@fuiste/optics";

const address = Prism<Person>().of({
  get: (p) => p.address,
  set: (a) => (p) => ({ ...p, address: a }),
});

address.get({ name: "Alice", age: 30 });
// undefined

address.get({ name: "Alice", age: 30, address: { street: "Main", zip: "53703" } });
// { street: "Main", zip: "53703" }
```

When you call `set` with a function updater and the prism's `get` returns `undefined`, the update is a no-op. The structure comes back unchanged. This is the correct behavior — you cannot update something that is not there.

## Isomorphisms

An **iso** is a total, invertible mapping between two types. If you can convert `A` to `B` and back without losing information, that is an isomorphism.

```ts
import { Iso } from "@fuiste/optics";

const cents = Iso<number, string>({
  to: (n) => `$${(n / 100).toFixed(2)}`,
  from: (s) => Math.round(parseFloat(s.replace("$", "")) * 100),
});

cents.to(1999);    // "$19.99"
cents.from("$19.99"); // 1999
```

Isos are useful on their own, but they really shine in composition. When you compose a prism with an iso, the iso's `from` function lets you _create_ the inner value even when the prism's `get` returned `undefined`. The library calls this materialization, and it means you can set through an optional path using a concrete value in a different representation.

## Traversals, Getters, and Folds

Three more optic types round out the toolkit:

- A **traversal** focuses on _zero or more_ values. Think "all elements of an array" or "all even numbers in a list." It has `getAll` and `modify`.
- A **getter** is a read-only lens. One value, no `set`.
- A **fold** is a read-only traversal. Many values, no `modify`.

These exist because not every accessor should be writable, and not every accessor should target exactly one thing. The type system encodes these constraints — if you compose two optics and one of them is read-only, the result is read-only. You cannot accidentally call `set` on a fold.

## Composition

This is the point of the whole exercise. Any two optics whose types line up can be composed into a new optic:

```ts
import { Lens, Prism, compose } from "@fuiste/optics";

const address = Prism<Person>().of({
  get: (p) => p.address,
  set: (a) => (p) => ({ ...p, address: a }),
});

const zip = Lens<Address>().prop("zip");

const personZip = compose(address, zip);
```

`personZip` is now a single optic — a prism, because the outer optic was a prism — that reaches two levels deep. You use it exactly like any other optic:

```ts
personZip.get({ name: "Alice", age: 30, address: { street: "Main", zip: "53703" } });
// "53703"

personZip.get({ name: "Alice", age: 30 });
// undefined

personZip.set("10001")({ name: "Alice", age: 30, address: { street: "Main", zip: "53703" } });
// { name: "Alice", age: 30, address: { street: "Main", zip: "10001" } }
```

The composition rules are deterministic. Lens + Lens = Lens. Lens + Prism = Prism. Anything + Fold = Fold. The library handles the dispatch at runtime based on the `_tag` of each optic, and the TypeScript overloads make sure the return type is correct at compile time.

What matters here is that the depth of the nesting does not affect the ergonomics. Composing three, four, five optics deep is the same two-argument `compose` call chained together, and each intermediate result is a first-class optic you can reuse, pass around, or compose further. No spread chains. No optional checks. Just functions.

## Combinators

The library ships three helpers that cover common patterns:

**`guard`** creates a prism from a type guard. Useful for discriminated unions:

```ts
import { guard } from "@fuiste/optics";

type Shape = { type: "circle"; radius: number } | { type: "square"; side: number };

const circle = guard<Shape, { type: "circle"; radius: number }>(
  (s): s is { type: "circle"; radius: number } => s.type === "circle"
);

circle.get({ type: "circle", radius: 5 }); // { type: "circle", radius: 5 }
circle.get({ type: "square", side: 3 });   // undefined
```

**`at`** creates a prism focusing on a key in a `Record`:

```ts
import { at } from "@fuiste/optics";

const auth = at<string>("Authorization");

auth.get({ Authorization: "Bearer x" }); // "Bearer x"
auth.get({});                             // undefined
```

**`each`** creates a traversal over all elements of an array:

```ts
import { each } from "@fuiste/optics";

const nums = each<number>();

nums.getAll([1, 2, 3]);              // [1, 2, 3]
nums.modify((n) => n * 2)([1, 2, 3]); // [2, 4, 6]
```

These compose with everything else. `compose(someLens, each())` gives you a traversal over all elements of an array nested inside a structure, with full type safety and immutable updates.

## Putting it Together

Here is a more realistic example. Say we have an application state:

```ts
type AppState = {
  users: ReadonlyArray<User>;
};

type User = {
  id: string;
  name: string;
  settings: UserSettings;
};

type UserSettings = {
  theme: "light" | "dark";
  notifications: boolean;
};
```

We can build a toolkit of reusable optics:

```ts
const users    = Lens<AppState>().prop("users");
const allUsers = compose(users, each<User>());
const settings = Lens<User>().prop("settings");
const theme    = Lens<UserSettings>().prop("theme");

const allThemes = compose(allUsers, compose(settings, theme));
```

Now `allThemes` is a traversal that reaches _into every user's settings and focuses on their theme_. To flip everyone to dark mode:

```ts
allThemes.modify(() => "dark")(state);
```

One line. Fully immutable. Fully typed. No spread chains, no loops, no intermediate variables. Every piece of this — `users`, `allUsers`, `settings`, `theme`, `allThemes` — is a standalone, reusable, composable unit.

## Is This Worth It?

Same caveat as the first post: maybe.

Optics come from Haskell, where they are both more powerful and more terrifying. The TypeScript version is necessarily a simplification — we do not have higher-kinded types, so the encoding is more manual. But the core value proposition holds: _if you work with immutable nested data, optics make the updates composable and the types honest_.

The library is zero-dependency, tree-shakeable, and small. The entire thing is a handful of functions and a tagged union. If you already buy the argument from the first post that functional style can reduce whole classes of bugs, optics are a natural next step — they bring the same composability and type safety to data access that `pipe` brings to transformations.

[`@fuiste/optics` on GitHub](https://github.com/Fuiste/optics)
