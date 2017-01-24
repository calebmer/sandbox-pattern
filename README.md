# Sandbox Pattern

[![Greenkeeper badge](https://badges.greenkeeper.io/calebmer/sandbox-pattern.svg)](https://greenkeeper.io/)

Working on a project where your javascript files are arbitrarily loaded? Need a tool besides CommonJS or Browserify to easily manage dependencies? Then you should consider using the sandbox pattern.

The code in this repository is an implementation of the Sandbox javascript pattern as illustrated in Stoyan Stefanov's book [Javascript Patterns](http://www.amazon.com/JavaScript-Patterns-Stoyan-Stefanov/dp/0596806752).

## Installation

### NodeJS:

```bash
$ npm install --save sandbox-pattern
```

and in your javascript:

```javascript
var sandbox = require('sandbox-pattern');

// Glorius
```

### Meteor:

```bash
$ meteor add calebmer:sandbox
```

Are you using Meteor? Awesome, there are just a few things you [really should know](https://github.com/calebmer/sandbox-pattern#dear-meteor-users).

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

### Manual Startup Control

In instances where sandboxes are defined asynchronously you need to manually choose when to start your sandboxes. By default, `setTimeout` is used to delay sandbox execution to the next loop. This is so that all the module references are defined by the time the sandboxes are executed. To manually accomplish this do the following:

```javascript
sandbox.configure({
  startupWait: true
});

// Asynchronously define sandboxes

sandbox.startup();

// Sandbox has been reset
```

### ECMA Script 6

With the coming adoption of ES6 (or with a tool like [Babel](https://babeljs.io/)) there is a nice syntactic sugar developers can use to easily access data inside the `box` variable. That would be by object destructuring in a way similar to that below, assuming the `bird` and `dog` modules are defined.

```javascript
sandbox(['bird', 'dog'], function ({ bird, dog }) {
  console.log(bird === undefined); // # => false
  console.log(dog === undefined);  // # => false
  console.log(box === undefined);  // # => true
});
```

## Dear Meteor Users

This package was initially created for Meteor, however the majority of the documentation is written for an NPM audience as NPM is more universal. As such there are a few differences Meteor users must know about. The docs have always referred to the sandbox variable as `sandbox`, however in Meteor it is defined as `Sandbox` with a capital S. That is *very important* to remember.

Second, since Meteor files are loaded asynchronously on the client, manual startup mode has been enabled for both sides (@see [Manual Startup Control](https://github.com/calebmer/sandbox-pattern#manual-startup-control)). Essentially that means you need to put a `main.js` file in the root of your directory (it must load last!) and run:

```javascript
Sandbox.startup();
```

Remember, in Meteor it is `Sandbox`, not `sandbox`!

## Is the README comprehensible?

If you don't understand something, or anything seems unclear, please submit an issue.

## So long and thanks for all the fish

Enjoy the package? Connect with me on [Twitter](https://twitter.com/calebmer).

Make sure to check out the package on:
- [npmjs.com](https://www.npmjs.com/package/sandbox-pattern)
- [atmospherejs.com](https://atmospherejs.com/calebmer/sandbox)
