#! /usr/bin/env node

var re = /^\d\d?\.\d\d?\.\d\d?$/;
var version = require('./package.json').version;
var versionIsPrerelease = !re.test(version);
var npmTagIsLatest = process.env.npm_config_tag === 'latest';
var publishShouldBeRejected = npmTagIsLatest && versionIsPrerelease;

if (publishShouldBeRejected) {
    console.error('It seems that version "%s" is pre-release. Rejecting publishing it to latest npm tag.', version);
    console.error(' Did you mean this?');
    console.error('	npm publish --tag=dev');
    process.exit(1);
}
