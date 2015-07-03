Package.describe({
  name: "patrickleet:tags",
  summary: "Add groups of tags to selected collections",
  version: "1.1.3",
  git: "https://github.com/patrickleet/tags"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.0.3.1');
  
  api.use(['livedata', 'mongo-livedata'], ['client', 'server']);
  api.use('aldeed:collection2@2.3.2', ['client', 'server'], {weak: true});
  api.use('aldeed:simple-schema@1.3.0', ['client', 'server'], {weak: true});
  
  api.addFiles('patrickleet-tags.js', ['client', 'server']);

  if (api.export !== undefined) {
    api.export('Tags');
  }
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('patrickleet-tags');
  api.addFiles('patrickleet-tags-tests.js');
});
