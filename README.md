# Sandbox Pattern

Working on a project where your javascript files are arbitrarily loaded? Need a tool besides CommonJS or Browserify to easily manage dependencies? Then you should consider using the sandbox pattern.

The code in this repository is an implementation of the Sandbox javascript pattern as illustrated in Stoyan Stefanov's book [Javascript Patterns](http://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752).

## Installation

To use with NodeJS:
```bash
$ npm install --save sandbox-pattern
```

To use with Meteor:
```bash
$ meteor add calebmer:sandbox
```

Important note for **Meteor** users. In the following documentation the variable is referred to as `sandbox`, but in Meteor the variable is exported as `Sandbox`. With a capital S.

## Usage

A sandbox is a scoped context block with one variable passed in, the `box` variable. The easiest way to visualize how the sandbox module works is with the following (we assume `sandbox` is defined in the global scope, `Sandbox` for Meteor users).

```javascript
sandbox('bird', function () {
  return {
    chirp: function () {
      console.log('cawcaw!');
    }
  };
});

sandbox(['bird'], function (box) {
  box.bird.chirp(); // # => cawcaw!
});
```

This may seem completely useless until you realize that the `sandbox` function allows you to define your "sandboxes" in any order. The following code will give the exact same output.

```javascript
sandbox(['bird'], function (box) {
  box.bird.chirp(); // # => cawcaw!
});

sandbox('bird', function () {
  return {
    chirp: function () {
      console.log('cawcaw!');
    }
  };
});
```

### Import and Export

A sandbox can be a module, and can call for modules at the same time. As long as no circular dependencies exist this will be fine. For example:

```javascript
sandbox('bird', function () {
  return { color: 'tomato' };
});

sandbox('cat', ['bird'], function (box) {
  return { chases: [box.bird] };
});

sandbox(['bird', 'cat'], function (box) {
  console.log(box.bird.color === box.cat.chases[0].color); // # => true
});
```

### Extending modules

One can also extend modules. Remember, the following sandboxes can be called in any order and the same output will be realized.

```javascript
sandbox('bird', function () {
  return { color: 'tomato' };
});

sandbox('bird', function () {
  return {
    chirp: function () {
      console.log('cawcaw!');
    }
  };
});

sandbox(['bird'], function (box) {
  console.log(box.bird.color); // # => tomato
  box.bird.chirp();            // # => cawcaw!
});
```

### Dot Syntax

You can use javascript's dot syntax to define module components.

```javascript
sandbox('bird.color', function () {
  return 'tomato';
});
```

Will produce the same effect as:

```javascript
sandbox('bird', function () {
  return { color: 'tomato' };
});
```

When declaring a module as a dependency, all child modules will also be added to the dependency list. For example, if one called for `bird` and `bird.color` was defined as a module, `bird.color` would be included in the box.

One advantage to using the dot syntax is you can retrieve them independently from the parent module. Again, the sandboxes can be defined in any order.

```javascript
sandbox('bird', function () {
  return { gender: 'female' };
});

sandbox('bird.color', function () {
  return 'tomato';
});

sandbox('bird.size', function () {
  return 42;
});

sandbox(['bird.color'], function (box) {
  console.log(box.bird.color);  // # => tomato
  console.log(box.bird.gender); // # => undefined
  console.log(box.bird.size);   // # => undefined
});

sandbox(['bird'], function (box) {
  console.log(box.bird.color);  // # => tomato
  console.log(box.bird.gender); // # => female
  console.log(box.bird.size);   // # => 42
});
```

### Error Handling

On some occasions, such as when a module does not exist, or a circular dependency is found, errors will be thrown. If you want to handle the error just add another parameter to the box function. For example:

```javascript
sandbox(['doesNotExist'], function (err, box) {
  console.log(err); // # => (some Error)
  console.log(box); // # => undefined
});
```

If there is no error, `err` would be undefined and `box` would have the traditional box modules.

## How it Works

Process loops (TODO: extend)

## Is the README comprehensible?

If you don't understand something, or anything seems unclear, please submit an issue.

## So long and thanks for all the fish

Enjoy the package? Connect with me on [Twitter](https://twitter.com/calebmer).

Make sure to check out the package on:
- [npmjs.com](https://www.npmjs.com/package/sandbox-pattern)
- [atmospherejs.com](https://atmospherejs.com/calebmer/sandbox)
