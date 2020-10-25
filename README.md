# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Find keys in object hierarchies using wildcard and regex matching and callbacks.

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<!-- eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies -->
```js
const objectScan = require('object-scan');

const haystack = { a: { b: { c: 'd' }, e: { f: 'g' } } };
objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```


## Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Separate Object and Array matching
- Wildcard and Regex matching
- Arbitrary depth matching
- Or-clause Syntax
- Exclusion Matching
- Full support for escaping
- Results returned in "delete-safe" order
- Recursion free implementation
- Search syntax validated
- Lots of tests

## Matching

Matching is based on the [property accessor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Property_accessors) syntax
with some notable extensions.

### Array

Rectangular brackets for array path matching.

_Examples_:
<details><summary> <code>['[2]']</code> <em>(exact in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4];
objectScan(['[2]'], { joined: true })(haystack);
// => [ '[2]' ]
```
</details>
<details><summary> <code>['[2]']</code> <em>(no match in object)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { 0: 'a', 1: 'b', 2: 'c' };
objectScan(['[2]'], { joined: true })(haystack);
// => []
```
</details>

### Object

Property name for object property matching.

_Examples_:
<details><summary> <code>['foo']</code> <em>(exact in object)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { foo: 0, bar: 1 };
objectScan(['foo'], { joined: true })(haystack);
// => [ 'foo' ]
```
</details>
<details><summary> <code>['1']</code> <em>(no match in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2, 3, 4];
objectScan(['1'], { joined: true })(haystack);
// => []
```
</details>

### Wildcard

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

Wildcards can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['*']</code> <em>(top level)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 1 }, d: 2 };
objectScan(['*'], { joined: true })(haystack);
// => [ 'd', 'a' ]
```
</details>
<details><summary> <code>['[?5]']</code> <em>(two digit ending in five)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [...Array(30).keys()];
objectScan(['[?5]'], { joined: true })(haystack);
// => [ '[25]', '[15]' ]
```
</details>
<details><summary> <code>['a.+.c']</code> <em>(nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { f: 0 } } };
objectScan(['a.+.c'], { joined: true })(haystack);
// => [ 'a.b.c' ]
```
</details>
<details><summary> <code>['a.\\+.c']</code> <em>(escaped)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, '+': { c: 0 } } };
objectScan(['a.\\+.c'], { joined: true })(haystack);
// => [ 'a.\\+.c' ]
```
</details>

### Regex

Regex are defined by using parentheses.

Can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['(^foo)']</code> <em>(starting with `foo`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { foo: 0, foobar: 1, bar: 2 };
objectScan(['(^foo)'], { joined: true })(haystack);
// => [ 'foobar', 'foo' ]
```
</details>
<details><summary> <code>['[(5)]']</code> <em>(containing `5`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [...Array(20).keys()];
objectScan(['[(5)]'], { joined: true })(haystack);
// => [ '[15]', '[5]' ]
```
</details>
<details><summary> <code>['[(^[01]$)]']</code> <em>(`[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[(^[01]$)]'], { joined: true })(haystack);
// => [ '[1]', '[0]' ]
```
</details>
<details><summary> <code>['[(^[^01]$)]']</code> <em>(other than `[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[(^[^01]$)]'], { joined: true })(haystack);
// => [ '[3]', '[2]' ]
```
</details>
<details><summary> <code>['[*]', '[!(^[01]$)]']</code> <em>(match all and exclude `[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[*]', '[!(^[01]$)]'], { joined: true })(haystack);
// => [ '[3]', '[2]' ]
```
</details>

### Arbitrary Depth

There are two types of arbitrary depth matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Recursions can be combined with a regex by appending the regex.

_Examples_:
<details><summary> <code>['a.**']</code> <em>(zero or more nestings under `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 0 } };
objectScan(['a.**'], { joined: true })(haystack);
// => [ 'a.c', 'a.b', 'a' ]
```
</details>
<details><summary> <code>['a.++']</code> <em>(one or more nestings under `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 0 } };
objectScan(['a.++'], { joined: true })(haystack);
// => [ 'a.c', 'a.b' ]
```
</details>
<details><summary> <code>['**(1)']</code> <em>(all containing `1`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { 0: { 1: ['a', 'b'] }, 1: { 1: ['c', 'd'] } };
objectScan(['**(1)'], { joined: true })(haystack);
// => [ '1.1[1]', '1.1', '1' ]
```
</details>

### Or Clause

Or Clauses are defined by using curley brackets.

Can be used with Array and Object selector.

_Examples_:
<details><summary> <code>['[{0,1}]']</code> <em>(`[0]` and `[1]`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = ['a', 'b', 'c', 'd'];
objectScan(['[{0,1}]'], { joined: true })(haystack);
// => [ '[1]', '[0]' ]
```
</details>
<details><summary> <code>['{a,d}.{b,f}']</code> <em>(`a.b`, `a.f`, `d.b` and `d.f`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: 0, c: 1 }, d: { e: 2, f: 3 } };
objectScan(['{a,d}.{b,f}'], { joined: true })(haystack);
// => [ 'd.f', 'a.b' ]
```
</details>

### Exclusion

To exclude a path, use exclamation mark.

_Examples_:
<details><summary> <code>['{a,b},!a']</code> <em>(only `b`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 1 };
objectScan(['{a,b},!a'], {
  joined: true,
  strict: false
})(haystack);
// => [ 'b' ]
```
</details>
<details><summary> <code>['**,!**.a']</code> <em>(all except ending in `a`)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: { a: 1, c: 2 } };
objectScan(['**,!**.a'], { joined: true })(haystack);
// => [ 'b.c', 'b' ]
```
</details>

### Escaping

The following characters are considered special and need to
be escaped using `\`, if they should be matched in a key:<br>
`[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*`, `+` and `\`.

_Examples:_
<details><summary> <code>['\\[1\\]']</code> <em>(special object key)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { '[1]': 0 };
objectScan(['\\[1\\]'], { joined: true })(haystack);
// => [ '\\[1\\]' ]
```
</details>

## Options

Signature of all callbacks is

    Fn({
      key, value, parent, parents, isMatch, matchedBy, excludedBy, traversedBy, isCircular
      getKey, getValue, getParent, getParents, getIsMatch, getMatchedBy, getExcludedBy, getTraversedBy, getIsCircular
      context
    })

where:

- `key`: key that callback is invoked for (respects `joined` option).
- `value`: value for key.
- `parent`: current parent.
- `parents`: array of form `[parent, grandparent, ...]`.
- `isMatch`: true iff last targeting needle exists and is non-excluding.
- `matchedBy`: all non-excluding needles targeting key.
- `excludedBy`: all excluding needles targeting key.
- `traversedBy`: all needles involved in traversing key.
- `isCircular`: true iff `value` contained in `parents`
- `getKey`: function that returns `key`
- `getValue`: function that returns `value`
- `getParent`: function that returns `parent`
- `getParents`: function that returns `parents`
- `getIsMatch`: function that returns `isMatch`
- `getMatchedBy`: function that returns `matchedBy`
- `getExcludedBy`: function that returns `excludedBy`
- `getTraversedBy`: function that returns `traversedBy`
- `getIsCircular`: function that returns `isCircular`
- `context`: as passed into the search

Notes on Performance:
- Arguments backed by getters use [Functions Getter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get)
and should be accessed via [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Unpacking_fields_from_objects_passed_as_function_parameter) to prevent redundant computation.
- Getters should be used to improve performance for conditional access. E.g. `if (isMatch) { getParents() ... }`.
- For performance reasons, the same object is passed to all callbacks.

#### filterFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every match. If `false`
is returned, the current key is excluded from the result.

The return value of this callback has no effect when a search context is provided.

Can be used to do processing as matching keys are traversed.

Invoked in same order as matches would appear in result.

This method is conceptually similar to
[Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

_Examples_:
<details><summary> <code>['**']</code> <em>(filter function)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: 0, b: 'bar' };
objectScan(['**'], {
  joined: true,
  filterFn: ({ value }) => typeof value === 'string'
})(haystack);
// => [ 'b' ]
```
</details>

#### breakFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

_Examples_:
<details><summary> <code>['**']</code> <em>(break function)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { e: 1 }, f: 2 } };
objectScan(['**'], {
  joined: true,
  breakFn: ({ key }) => key === 'a.b'
})(haystack);
// => [ 'a.f', 'a.d.e', 'a.d', 'a.b', 'a' ]
```
</details>

#### rtn

Type: `string`<br>
Allowed: [`context`, `keys`, `values`, `entries`, `key`, `value`, `entry`]<br>
Default: _dynamic_

Defaults to `keys` when search context is undefined and to `context` otherwise.

When explicitly set:
- `context`: search context is returned
- `keys`: all matched keys are returned
- `values`: all matched values are returned
- `entries`: all matched entries are returned
- `key`: first matched key is returned (aborts scan)
- `value`: first matched value is returned (aborts scan)
- `entry`: first matched entry is returned (aborts scan)

_Examples_:
<details><summary> <code>['*.*.*']</code> <em>(return values)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { e: 1 }, f: 2 } };
objectScan(['*.*.*'], { rtn: 'values' })(haystack);
// => [ 1, 0 ]
```
</details>
<details><summary> <code>['*.*.*']</code> <em>(first matched entry, aborts)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { e: 1 }, f: 2 } };
objectScan(['*.*.*'], { rtn: 'entry' })(haystack, []);
// => [ [ 'a', 'd', 'e' ], 1 ]
```
</details>
<details><summary> <code>['*.*.*']</code> <em>(return undefined context)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { e: 1 }, f: 2 } };
objectScan(['*.*.*'], { rtn: 'context' })(haystack);
// => undefined
```
</details>
<details><summary> <code>['*.*.*']</code> <em>(return keys with context passed)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0 }, d: { e: 1 }, f: 2 } };
objectScan(['*.*.*'], { rtn: 'keys' })(haystack, []);
// => [ [ 'a', 'd', 'e' ], [ 'a', 'b', 'c' ] ]
```
</details>

#### joined

Type: `boolean`<br>
Default: `false`

Keys are returned as a string when set to `true` instead of as a list.

Setting this option to `true` will negatively impact performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

_Examples_:
<details><summary> <code>['[*]']</code> <em>(joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2];
objectScan(['[*]'], { joined: true })(haystack);
// => [ '[2]', '[1]', '[0]' ]
```
</details>
<details><summary> <code>['[*]']</code> <em>(not joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [0, 1, 2];
objectScan(['[*]'])(haystack);
// => [ [ 2 ], [ 1 ], [ 0 ] ]
```
</details>

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to `false`, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

_Examples_:
<details><summary> <code>['a', 'b.d']</code> <em>(automatic array traversal)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [{ a: 0 }, { b: [{ c: 1 }, { d: 2 }] }];
objectScan(['a', 'b.d'], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1].b[1].d', '[0].a' ]
```
</details>
<details><summary> <code>['']</code> <em>(top level array matching)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [{ a: 0 }, { b: 1 }];
objectScan([''], {
  joined: true,
  useArraySelector: false
})(haystack);
// => [ '[1]', '[0]' ]
```
</details>

#### strict

Type: `boolean`<br>
Default: `true`

When set to `true`, errors are thrown when:
- a path is identical to a previous path
- a path invalidates a previous path
- a path contains consecutive recursions

_Examples_:
<details><summary> <code>['a.b', 'a.b']</code> <em>(identical)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.b', 'a.b'], { joined: true })(haystack);
// => 'Error: Redundant Needle Target: "a.b" vs "a.b"'
```
</details>
<details><summary> <code>['a.{b,b}']</code> <em>(identical, same needle)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.{b,b}'], { joined: true })(haystack);
// => 'Error: Redundant Needle Target: "a.{b,b}" vs "a.{b,b}"'
```
</details>
<details><summary> <code>['a.b', 'a.**']</code> <em>(invalidates previous)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['a.b', 'a.**'], { joined: true })(haystack);
// => 'Error: Needle Target Invalidated: "a.b" by "a.**"'
```
</details>
<details><summary> <code>['**.!**']</code> <em>(consecutive recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = [];
objectScan(['**.!**'], { joined: true })(haystack);
// => 'Error: Redundant Recursion: "**.!**"'
```
</details>

### Search Context

A context can be passed into a search invocation as a second parameter. It is available in all callbacks
and can be used to manage state across a search invocation without having to recompile the search.

By default all matched keys are returned from a search invocation.
However, when it is not undefined, the context is returned instead.

_Examples_:
<details><summary> <code>['**']</code> <em>(last segments only)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 0, d: 1 }, e: 2 } };
objectScan(['**'], {
  filterFn: ({ key, context }) => { context.push(key[key.length - 1]); }
})(haystack, []);
// => [ 'e', 'd', 'c', 'b', 'a' ]
```
</details>

## Examples

More extensive examples can be found in the tests.

<details><summary> <code>['a.*.f']</code> <em>(nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>

<details><summary> <code>['*.*.*']</code> <em>(multiple nested)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*.*.*'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>

<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.{c,f}'], { joined: true })(haystack);
// => [ 'a.e.f', 'a.b.c' ]
```
</details>

<details><summary> <code>['a.*.{c,f}']</code> <em>(or filter, not joined)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*.{c,f}'])(haystack);
// => [ [ 'a', 'e', 'f' ], [ 'a', 'b', 'c' ] ]
```
</details>

<details><summary> <code>['*.*[*]']</code> <em>(list filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*.*[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>

<details><summary> <code>['*[*]']</code> <em>(list filter, unmatched)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['*[*]'], { joined: true })(haystack);
// => []
```
</details>

<details><summary> <code>['**']</code> <em>(star recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**'], { joined: true })(haystack);
// => [ 'k', 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b', 'a' ]
```
</details>

<details><summary> <code>['++.++']</code> <em>(plus recursion)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['++.++'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]', 'a.h', 'a.e.f', 'a.e', 'a.b.c', 'a.b' ]
```
</details>

<details><summary> <code>['**.f']</code> <em>(star recursion ending in f)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**.f'], { joined: true })(haystack);
// => [ 'a.e.f' ]
```
</details>

<details><summary> <code>['**[*]']</code> <em>(star recursion ending in array)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**[*]'], { joined: true })(haystack);
// => [ 'a.h[1]', 'a.h[0]' ]
```
</details>

<details><summary> <code>['a.*,!a.e']</code> <em>(exclusion filter)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['a.*,!a.e'], { joined: true })(haystack);
// => [ 'a.h', 'a.b' ]
```
</details>

<details><summary> <code>['**.(^[bc]$)']</code> <em>(regex matching)</em> </summary>

<!-- eslint-disable no-undef -->
```js
const haystack = { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' };
objectScan(['**.(^[bc]$)'], { joined: true })(haystack);
// => [ 'a.b.c', 'a.b' ]
```
</details>

## Edge Cases

The top level object(s) are matched by the empty needle `""`.
Useful for matching objects nested in arrays by setting `useArraySelector` to `false`.
Note that the empty string does not work with [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set).

## Internals

Conceptually this package works as follows:

1. During initialization the needles are parsed and built into a search tree.
Various information is pre-computed and stored for every node.
Finally the search function is returned.

2. When the search function is invoked, the input is traversed simultaneously with
the relevant nodes of the search tree. Processing multiple search tree branches
in parallel allows for a single traversal of the input.

Having a separate initialization stage allows for a performant search and
significant speed ups when applying the same search to different input.
