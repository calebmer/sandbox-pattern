Npm.depends({ 'sandbox-pattern': '1.0.3' });

Package.describe({
  name:    'calebmer:sandbox',
  version: '1.1.0',
  summary: 'Helps rationalize load order in meteor for large applications',
  git:     'https://github.com/calebmer/sandbox-pattern.git',

  documentation: '../README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.0']);

  api.addFiles(['sandbox.js'], 'server');

  api.use(['stevezhu:lodash@3.8.0'], 'client');
  api.imply(['stevezhu:lodash']);

  api.addFiles([
    'environment.js',
    '.npm/package/node_modules/sandbox-pattern/lib/sandbox.js',
    'main.js'
  ], 'client');

  api.export('Sandbox');
});
