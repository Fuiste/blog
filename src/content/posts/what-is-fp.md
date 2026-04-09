---
title: What is FP?
description: Functional programming as a style, from pure code to composition, with examples in TypeScript.
pubDate: 2025-02-19
updatedDate: 2025-02-20
tags:
  - Functional Programming
  - TypeScript
  - Software Design
featured: true
draft: false
---

Functional programming means writing pure code that primarily leverages functions as values.

## Pure Code

Pure code is code with no side effects. Side effects are anything our code does outside taking inputs and returning outputs.

Some examples:

- Updating a global state is a side effect.
- Logging to the console is a side effect.
- User I/O is a side effect.

Of course, side-effect free code does not actually do much. Basically any product requirement is going to by definition be a side effect.

So, more pragmatically, functional code is concerned with _minimizing and encapsulating side effects_.

## Functions as Values

When we talk about "functions as values" we mean a few things. In general, functional code will do some or all of the following:

- Write functions that take functions as arguments.
- Write functions that return other functions.
- Treat the evaluation of a function identically to the value it returns.

This dovetails nicely with the concept of pure code, because a pure function is identical to its return, insofar as the program is concerned.

In functional programming terms, this is called **referential transparency**. Meaning that any function call can safely be replaced with its return value with no effect on the larger program.

# Functional Programming is a Style

At the end of the day, functional programming is just a style that, when adhered to sufficiently, allows us to make some useful assumptions about the way our programs will behave.

# Examples From First Principles

These examples assume familiarity with [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html).

## Basics

### Add

In the functional style, we tend to prefer functions with single arguments, called **unary functions**. This allows for easier composition and reuse, as we will see below.

Let us start with a simple function that adds two numbers, returning their sum:

```ts
const add =
  (a: number) =>
  (b: number) =>
    a + b;

// const five: number (5)
const five = add(3)(2);

// const addTwo: (b: number) => number
const addTwo = add(2);

// const fiveAgain: number (5)
const fiveAgain = addTwo(3);
```

Some things to note:

- Defining functions with single arguments which return functions until their arguments are satisfied is called **currying**.
- Using currying, we can arbitrarily create new "adder" functions with partially applied arguments, allowing us to simplify the mental overhead needed to understand our programs.
- Strong typing is inferred for these partially applied functions.

## List Operations

In the examples below, you will note that we prefer **recursion** over **iteration**. Aside from being the general style used in functional languages, it shows these behaviors can be expressed in an **immutable** way. We do not actually need to update variables and traverse lists to create new values from old ones.

So we have an `add` function. While it illustrates some basic stylistic conventions, it is not particularly useful. Luckily, we have a whole class of operations we are likely already familiar with from the functional world that we use every day in JavaScript: _list operations_.

### Filter

Let us recreate one of the most common operations in JavaScript, filtering a list based on a predicate.

A **predicate** in programming is a logical condition that evaluates to either true or false. Predicates are used in programming to filter collections, search for matching elements, and more.

```ts
const filter =
  <A>(predicate: (a: A) => boolean) =>
  ([head, ...tail]: A[]): A[] =>
    head
      ? predicate(head)
        ? [head, ...filter(predicate)(tail)]
        : filter(predicate)(tail)
      : [];

// Given a list of names
const names = ["Bob", "Jane", "Sandra"];

// ...and a function which returns true when one starts with 'B'
const startsWithB = (name: string) => name.startsWith("B");

// ...construct a list of names starting with 'B'
const bNames = filter(startsWithB)(names);
```

### Map

In [category theory](https://en.wikipedia.org/wiki/Category_theory), and by extension functional programming, mappings between two groups are referred to as **morphisms**. In the example below, `fn` is a morphism.

With that in mind, let us build `map`, which takes an array with elements of type `A` and returns an array with elements of type `B`, given a function which transforms `A` to `B`.

```ts
const map =
  <A, B>(fn: (a: A) => B) =>
  ([head, ...tail]: A[]): B[] =>
    head
      ? tail.length
        ? [fn(head), ...map(fn)(tail)]
        : [fn(head)]
      : [];

// Given a list of numbers
const arr = [1, 2, 3];

// ...and a function which doubles a number
const double = (a: number) => add(a)(a);

// ...construct a list of doubled numbers
const doubledArr = map(double)(arr);
```

### Reduce (Left Fold)

Finally, let us tackle our favorite and often misunderstood list function, `reduce`. In functional programming, this operation is more commonly referred to as a "left fold." Imagine starting at the left side of a list and folding each element onto the next one, creating some new structure or state as the result using the supplied lambda.

```ts
const foldLeft =
  <A, B>(lambda: (acc: B) => (a: A) => B) =>
  (acc: B) =>
  ([head, ...tail]: A[]): B =>
    head ? foldLeft(lambda)(lambda(acc)(head))(tail) : acc;

// Given a list of names
const names = ["Bob", "Jane", "Sandra"];

// ...and a function which returns their length
const len = (l: number) => (name: string) => add(l)(name.length);

// ...count the total characters in the list
const totalChars = foldLeft(len)(0)(names);
```

## Function Compositions

So we have `filter`, `map`, and `reduce`. Usually, we are not using these functions in isolation, but combining them to meet some desired result.

For example, let us say we have the following type, `Customer`:

```ts
type Customer = {
  name: string;
  zipcode: string;
  totalCentsSpent: number;
};
```

Given a list of `Customer`s, we want to get the total cents spent for all users in the Manhattan zipcode `10001`.

We _could_ write that function like this:

```ts
const isManhattan = ({ zipcode }: Customer) => zipcode === "10001";

const toCentsSpent = ({ totalCentsSpent }: Customer) => totalCentsSpent;

const accumulateSpend = (acc: number) => (totalSpent: number) => add(acc)(totalSpent);

const getSpend = (customers: Customer[]) =>
  foldLeft(accumulateSpend)(0)(map(toCentsSpent)(filter(isManhattan)(customers)));
```

This is not very legible.

The order of operations is semantically reversed. The first calculation, the `filter`, is actually the last piece the developer is likely to read. What we want to read is something like this pseudocode, using the `|>` operator from other, more expressive programming languages:

```ts
const getSpend = (customers: Customer[]) =>
  customers
    |> filter(isManhattan)
    |> map(toCentsSpent)
    |> foldLeft(accumulateSpend)(0);
```

JavaScript does not have this. Luckily, with a little TypeScript hacking, we can build a function pipe which does the same thing:

```ts
import { pipe } from "effect";

const getSpend = (customers: Customer[]) =>
  pipe(
    customers,
    filter(isManhattan),
    map(toCentsSpent),
    foldLeft(accumulateSpend)(0)
  );
```

**As an exercise**, try writing your own definition of `pipe`. We import it from `effect` here, but it is actually just a generalized function helper.

Now we have a function:

- With no internal variables or constants.
- Which reads top to bottom.
- And has no side effects.

# Is Any of this _Useful_?

I do not know, maybe?

The point is that it makes some interesting tradeoffs, and challenges the developer to think about problems in a different way. Through the functional lens, whole classes of error simply do not exist, because your code and types make them impossible. Additionally, your code describes _results_ rather than the steps to calculate them. In _some_ contexts, this leads to cleaner, easier to read functions.

Sometimes it does not.

The important thing is to make your code semantically clear in intent, and for the people working on it to be able to extend and iterate on it easily.

