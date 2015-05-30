Npm.depends({ 'sandbox-pattern': '1.0.4' });

Package.describe({
  name:    'calebmer:sandbox',
  version: '1.1.1',
  summary: 'Helps rationalize load order in meteor for large applications',
  git:     'https://github.com/calebmer/sandbox-pattern.git',

  documentation: '../README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.0']);

  api.addFiles(['server/main.js'], 'server');

  api.use(['stevezhu:lodash@3.8.0'], 'client');
  api.imply(['stevezhu:lodash']);

  api.addFiles([
    'client/environment.js',
    '.npm/package/node_modules/sandbox-pattern/lib/sandbox.js',
    'client/main.js'
  ], 'client');

  api.export('Sandbox');
});
