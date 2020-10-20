# Object-Scan

[![Build Status](https://circleci.com/gh/blackflux/object-scan.png?style=shield)](https://circleci.com/gh/blackflux/object-scan)
[![Test Coverage](https://img.shields.io/coveralls/blackflux/object-scan/master.svg)](https://coveralls.io/github/blackflux/object-scan?branch=master)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=blackflux/object-scan)](https://dependabot.com)
[![Dependencies](https://david-dm.org/blackflux/object-scan/status.svg)](https://david-dm.org/blackflux/object-scan)
[![NPM](https://img.shields.io/npm/v/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Downloads](https://img.shields.io/npm/dt/object-scan.svg)](https://www.npmjs.com/package/object-scan)
[![Semantic-Release](https://github.com/blackflux/js-gardener/blob/master/assets/icons/semver.svg)](https://github.com/semantic-release/semantic-release)
[![Gardener](https://github.com/blackflux/js-gardener/blob/master/assets/badge.svg)](https://github.com/blackflux/js-gardener)

Find keys in object hierarchies using wildcard and glob matching and callbacks.

## Install

Install with [npm](https://www.npmjs.com/):

    $ npm install --save object-scan

## Usage

<!-- <example>
haystack: { a: { b: { c: 'd' }, e: { f: 'g' } } }
needles: ['a.*.f']
spoiler: false
</example> -->

### Features

- Input traversed exactly once during search
- Dependency free, small in size and very performant
- Separate Object and Array matching
- Wildcard and Regex matching
- Arbitrary depth matching
- Or-clause Syntax
- Exclusion Matching
- Full support for escaping
- Results returned in "delete-safe" order
- Search syntax is checked for correctness
- Lots of tests to ensure correctness

### Options

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

#### breakFn

Type: `function`<br>
Default: `undefined`

If defined, this callback is invoked for every key that is traversed by
the search. If `true` is returned, all keys nested under the current key are
skipped in the search and from the final result.

Note that `breakFn` is invoked before the corresponding `filterFn` might be invoked.

#### joined

Type: `boolean`<br>
Default: `false`

Keys are returned as a string when set to `true` instead of as a list.

Setting this option to `true` will negatively impact performance.

Note that [_.get](https://lodash.com/docs/#get) and [_.set](https://lodash.com/docs/#set) fully support lists.

_Examples_:
<!-- <example>
haystack: [0, 1, 2]
needles: ['[*]']
joined: true
comment: joined
</example> -->
<!-- <example>
haystack: [0, 1, 2]
needles: ['[*]']
joined: false
comment: not joined
</example> -->

#### useArraySelector

Type: `boolean`<br>
Default: `true`

When set to `false`, no array selectors should be used in any needles and arrays are automatically traversed.

Note that the results still include the array selectors.

_Examples_:
<!-- <example>
haystack: [{ a: 0 }, { b: 1 }]
needles: ['']
useArraySelector: false
comment: select top level array elements
</example> -->

#### strict

Type: `boolean`<br>
Default: `true`

When set to `true`, errors are thrown when:
- a path is identical to a previous path
- a path invalidates a previous path
- a path contains consecutive recursions

_Examples_:
<!-- <example>
haystack: []
needles: ['a.b', 'a.b']
comment: identical
</example> -->
<!-- <example>
haystack: []
needles: ['a.{b,b}']
comment: identical, same needle
</example> -->
<!-- <example>
haystack: []
needles: ['a.b', 'a.**']
comment: invalidates previous
</example> -->
<!-- <example>
haystack: []
needles: ['**.!**']
comment: consecutive recursion
</example> -->

### Search Context

A context can be passed into a search invocation as a second parameter. It is available in all callbacks
and can be used to manage state across a search invocation without having to recompile the search.

By default all matched keys are returned from a search invocation.
However, when it is not undefined, the context is returned instead.

_Examples_:
<!-- <example>
haystack: { a: { b: { c: 0, d: 1 }, e: 2 } }
needles: ['**']
context: []
filterFn: ({ key, context }) => { context.push(key[key.length - 1]); }
joined: false
comment: output last segments only
</example> -->

## Matching

Matching is based on the Javascript Object / Array selector syntax
with some notable extensions.

### Array vs Object

To match an Array path, rectangular brackets are used.<br>
_Examples_:
<!-- <example>
haystack: [0, 1, 2, 3, 4]
needles: ['[2]']
comment: matches `[2]` in an array
</example> -->

To match an Object path, the name of the path is used.<br>
_Examples_:
<!-- <example>
haystack: { foo: 0, bar: 1 }
needles: ['foo']
comment: matches the path `foo` in an object
</example> -->

### Wildcard

Wildcards can be used with Array and Object selector.

The following characters have special meaning when not escaped:
- `*`: Match zero or more character
- `+`: Match one or more character
- `?`: Match exactly one character
- `\`: Escape the subsequent character

_Examples_:
<!-- <example>
haystack: [...Array(30).keys()]
needles: ['[1?]']
comment: matches two digit keys starting with a one
</example> -->

### Regex

Regex can be used with Array and Object selector by using parentheses.

_Examples_:<br>
<!-- <example>
haystack: { foo: 0, foobar: 1, bar: 2 }
needles: ['(^foo)']
comment: match all object paths starting with `foo`
</example> -->
<!-- <example>
haystack: [...Array(20).keys()]
needles: ['[(5)]']
comment: matches all array paths containing `5`
</example> -->
<!-- <example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[(^[01]$)]']
comment: match first and second path in an array
</example> -->

### Arbitrary Depth

There are two types of recursion matching:
- `**`: Matches zero or more nestings
- `++`: Matches one or more nestings

Recursions can be combined with a regex by appending the regex.

_Examples_:
<!-- <example>
haystack: { a: { b: 0, c: 0 } }
needles: ['a.**']
comment: matches zero or more nestings under `a`
</example> -->
<!-- <example>
haystack: { a: { b: 0, c: 0 } }
needles: ['a.++']
comment: matches one or more nestings under `a`
</example> -->
<!-- <example>
haystack: { 1: { 1: ['a', 'b'] } }
needles: ['**(1)']
comment: matches all paths containing `1`
</example> -->

### Or Clause

Can be used with Array and Object selector by using curley brackets.

This makes it possible to target multiple paths in a single needle. It also
makes it easier to reduce redundancy.

_Examples_:
<!-- <example>
haystack: ['a', 'b', 'c', 'd']
needles: ['[{0,1}]']
comment: match first and second path in an array
</example> -->

### Exclusion

To exclude a path from being matched, use the exclamation mark.

_Examples_:
<!-- <example>
haystack: { a: 0, b: { a: 1, c: 2 } }
needles: ['**,!**.a']
comment: matches all paths, except those where the last segment is `a`
</example> -->

### Escaping

The following characters are considered special and need to
be escaped using `\`, if they should be matched in a key:<br>
`[`, `]`, `{`, `}`, `(`, `)`, `,`, `.`, `!`, `?`, `*`, `+` and `\`.

## Examples

More extensive examples can be found in the tests.

<!-- <example>
haystack: { a: { b: { c: 'd' }, e: { f: 'g' }, h: ['i', 'j'] }, k: 'l' }
needles: ['*']
comment: top level keys
</example> -->

<!-- <example>
needles: ['a.*.f']
comment: nested keys
</example> -->

<!-- <example>
needles: ['*.*.*']
comment: multiple nested keys
</example> -->

<!-- <example>
needles: ['a.*.{c,f}']
comment: or filter
</example> -->

<!-- <example>
needles: ['a.*.{c,f}']
comment: or filter, not joined
joined: false
</example> -->

<!-- <example>
needles: ['*.*[*]']
comment: list filter
</example> -->

<!-- <example>
needles: ['*[*]']
comment: list filter, unmatched
</example> -->

<!-- <example>
needles: ['**']
comment: star recursion
</example> -->

<!-- <example>
needles: ['++.++']
comment: plus recursion
</example> -->

<!-- <example>
needles: ['**.f']
comment: star recursion ending to f
</example> -->

<!-- <example>
needles: ['**[*]']
comment: star recursion ending to array
</example> -->

<!-- <example>
needles: ['a.*,!a.e']
comment: exclusion filter
</example> -->

<!-- <example>
needles: ['**.(^[bc]$)']
comment: regex matching
</example> -->

<!-- <example>
needles: ['**']
comment: filter function
filterFn: ({ value }) => typeof value === 'string'
</example> -->

<!-- <example>
needles: ['**']
comment: break function
breakFn: ({ key }) => key === 'a.b'
</example> -->

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