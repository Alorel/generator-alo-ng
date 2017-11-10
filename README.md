# Angular library generator

[![Build Status](https://travis-ci.org/Alorel/generator-alo-ng.png?branch=master)](https://travis-ci.org/Alorel/generator-alo-ng)
[![Coverage Status](https://coveralls.io/repos/github/Alorel/generator-alo-ng/badge.svg?branch=master)](https://coveralls.io/github/Alorel/generator-alo-ng?branch=master)
[![Dependency status](https://david-dm.org/alorel/generator-alo-ng.svg)](https://david-dm.org/alorel/generator-alo-ng#info=dependencies&view=list)
[![Dev dependency status](https://david-dm.org/alorel/generator-alo-ng/dev-status.svg)](https://david-dm.org/alorel/generator-alo-ng#info=devDependencies&view=list)
[![Greenkeeper badge](https://badges.greenkeeper.io/Alorel/generator-alo-ng.svg)](https://greenkeeper.io/)

[![Version](https://img.shields.io/npm/v/generator-alo-ng.svg)](https://www.npmjs.com/package/generator-alo-ng)
[![License](https://img.shields.io/npm/l/generator-alo-ng.svg)](https://github.com/Alorel/generator-alo-ng/blob/master/LICENSE)

A Yeoman generator for AOT-compatible Angular 4 libraries in UMD, ESM5 and ESM2015 formats.

# Requirements

- Node >= 7.6

# Installation
```sh
npm install -g generator-alo-ng
```

# Usage

```sh
alo-ng
```

# Gulp commands inside bundle

- **build** - compile the library for UMD, ESM5 and ESM2015
- **build:demo:aot** - compile the demo site in AOT *without* minification
- **build:demo:aot:prod** - compile the demo site in AOT *with* minification
- **build:demo:jit** - compile the demo site in JIT
- **watch** - compile the demo site in JIT and watch for changes
- **server** - start the local dev server for the compiled JIT demo app
