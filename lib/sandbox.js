var _ = require('lodash');

var sandbox = function (/* moduleName, dependencies, callback, errorHandler */) {
  var moduleName;
  var dependencies = [];
  var callback;

  // Parse the arguments
  _.each(arguments, function (argument) {
    if (_.isString(argument)) {
      moduleName = argument;
    } else if (_.isArray(argument)) {
      dependencies = argument;
    } else if (_.isFunction(argument)) {
      callback = argument;
    }
  });

  var isModule      = moduleName ? true : false;
  var handlesErrors = callback.length === 2;

  // We are waiting on this to load if it is a module
  if (isModule) {
    sandbox.getModule(moduleName).waitingOn++;
  }

  // Unblock the following process
  // Inside the set timeout, a list of all modules should have been established
  setTimeout(function () {
    // Allows child modules to be a thing
    _.each(dependencies, function (dependency) {
      dependencies = dependencies.concat(sandbox.getChildren(dependency));
    });

    sandbox.onReady(dependencies, function (err) {
      if (err) {
        if (handlesErrors) {
          callback.call({}, err, undefined);
          return;
        } else {
          throw err;
        }
      }

      var context = {};

      // Add all the modules to the context
      _.each(dependencies, function (dependency) {
        _.set(context, dependency, sandbox.getModule(dependency).object);
      });

      var args = [context];

      // If the function handles errors, we should fill the err parameter space
      if (handlesErrors) {
        args.unshift(undefined);
      }

      // Run the module function with our context and then capture the result
      var extension = callback.apply({}, args);

      if (isModule) {
        // Extend the module with the return value
        sandbox.extendModule(moduleName, extension);
      }
    });
  }, 0);
};

sandbox._modules = {};

sandbox.reset = function () {
  sandbox._modules = {};
};

sandbox.getModule = function (moduleName) {
  if (!moduleName) {
    return undefined;
  }

  // If the module does not exist, create it and
  // give it default values
  if (!sandbox._modules[moduleName]) {
    sandbox._modules[moduleName] = {
      object:    undefined,
      callbacks: [],
      waitingOn: 0
    };
  }

  return sandbox._modules[moduleName];
};

sandbox.getChildren = function (moduleName) {
  var re       = new RegExp('^' + _.escapeRegExp(moduleName));
  var children = [];

  _.each(sandbox._modules, function (child, childName) {
    if (re.test(childName)) {
      children.push(childName);
    }
  });

  return children;
};

sandbox.extendModule = function (moduleName, extension) {
  var module = sandbox.getModule(moduleName);

  if (module.object) {
    _.extend(module.object, extension);
  } else {
    module.object = extension;
  }

  module.waitingOn--;

  // If all the sandboxes have loaded, call all of the callbacks
  if (module.waitingOn === 0) {
    _.each(module.callbacks, function (callback) {
      callback();
    });
  }
};

sandbox.onLoaded = function (moduleName, callback) {
  // Ensure callback only fires once
  callback = _.once(callback);

  var module = sandbox.getModule(moduleName);

  // If the module is already registered, fire the event now
  if (module.object && module.waitingOn === 0) {
    callback();
    return;
  }

  // If 5 seconds has passed, we should warn the user
  var wayToLong = setTimeout(function () {
    var err = new Error('Module \'' + moduleName + '\' has taken way too long to load, does it exist?');
    callback(err);
  }, 100);

  module.callbacks.push(function () {
    clearTimeout(wayToLong);
    callback();
  });
};

// Batch register callbacks
sandbox.onReady = function (dependencies, callback) {
  dependencies = _.unique(dependencies);

  // Ensure callback only fires once
  callback = _.once(callback);

  // If there are no dependencies
  if (!dependencies || dependencies.length === 0) {
    callback();
    return;
  }

  var waitingOn = dependencies.length;

  // To be called whenever a module gets registered
  var done = function (err) {
    // If error, pass it to the callback and set the callback to undefined
    if (err) {
      callback(err);
      return;
    }

    waitingOn--;

    // Once all modules have been registered
    if (waitingOn === 0) {
      callback();
    }
  };

  _.each(dependencies, function (dependency) {
    sandbox.onLoaded(dependency, done);
  });
};

module.exports = sandbox;
