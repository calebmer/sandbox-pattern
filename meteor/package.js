var version = '1.0.0';

Package.describe({
  name:    'calebmer:sandbox',
  version: version,
  summary: 'Helps rationalize load order in meteor for large applications',
  git:     'https://github.com/calebmer/sandbox-pattern.git',

  documentation: '../README.md'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@1.0']);
  api.addFiles(['sandbox.js']);
  api.export('Sandbox');
});

Npm.depends({
  'sandbox-pattern': version
});
