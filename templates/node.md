---
rename:
  basename: README.md
---
# <%= ask("name") %> [![NPM version](https://badge.fury.io/js/<%= ask("name") %>.svg)](https://npmjs.org/package/<%= ask("name") %>) [![Build Status](https://travis-ci.org/<%= ask("owner") %>/<%= ask("name") %>.svg?branch=master)](https://travis-ci.org/<%= ask("owner") %>/<%= ask("name") %>)

> <%= ask("description") %>

## Installation

```sh
$ npm install --save <%= ask("name") %>
```

## Usage

```js
var <%= camelcase(ask("name")) %> = require('<%= ask("name") %>');
<%= camelcase(ask("name")) %>();
```

## License
<% ask("license") %>
<%= ask("license") %> © [<%= ask("author.name") %>](<%= ask("author.url") %>)
