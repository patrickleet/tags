Package.describe({
  summary: "Add groups of tags to selected collections",
  version: "1.0.1",
  git: "https://github.com/patrickleet/tags"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.2.2');
  
  api.use(['livedata', 'mongo-livedata'], ['client', 'server']);
  api.use('aldeed:collection2@2.0.1', ['client', 'server'], {weak: true});
  api.use('aldeed:simple-schema@1.0.3', ['client', 'server'], {weak: true});
  
  api.addFiles('patrickleet:tags.js', ['client', 'server']);

  if (api.export !== undefined) {
    api.export('Tags');
  }
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('patrickleet:tags');
  api.addFiles('patrickleet:tags-tests.js');
});
