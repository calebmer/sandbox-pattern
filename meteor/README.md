NPM Wrapper for my package [sandbox-pattern](https://www.npmjs.com/package/sandbox-pattern)

Allows one to rationalize Meteor dependency load order for large applications using the sandbox javascript pattern. One of many examples is below, for more visit the [github](https://github.com/calebmer/sandbox-pattern) page.

```javascript
Sandbox(['bird'], function (box) {
  box.bird.chirp(); // # => cawcaw!
});

Sandbox('bird', function () {
  return {
    chirp: function () {
      console.log('cawcaw!');
    }
  };
});
```

It's important to note that the sandbox variable is imported as `Sandbox` and not as `sandbox`.
