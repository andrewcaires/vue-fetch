# vue-fetch

VueJS plugin for the Fetch API

## Installation

```npm i @andrewcaires/vue-fetch```

## Usage

```js
import VueFetch from '@andrewcaires/vue-fetch';
import Vue from 'vue';

Vue.use(VueFetch, {
  url: '/',             // url base
  headers: {},          // headers HTTP default
  logging: console.log, // execute on every request
  timeout: 5000,        // response timeout
});

export default Vue.extend({
  ...
  methods: {
    getUser(id) {
      const response = await this.$fetch.get(`users/${id}`);
      console.log(response);
    }
  },
  ...
});
```

## Methods

- `DELETE` / `GET`

```js
this.$fetch.del(path);

this.$fetch.del(path, {
  id: '123'
});

this.$fetch.get(path);

this.$fetch.get(path, {
  id: '123'
});
```

- `PATCH` / `POST` / `PUT`

```js
this.$fetch.patch(path, {
  name: 'Fred'
}, { id: 123 });

this.$fetch.post(path, {
  name: 'Fred'
});

this.$fetch.put(path, {
  name: 'Fred'
}, { id: 123 });
```

- `FETCH`

```js
this.$fetch.fetch({
  url: 'http://localhost',
  path: '/users',
  query: { id: '123' },
  method: 'PUT',
  body: { name: 'Fred' },
  headers: {},
  timeout: 5000,
});
```

## New Instance

```js
const fetch2 = this.$fetch.create({
  url: '/',
  headers: {},
  logging: console.log,
  timeout: 5000,
});

const response = await fetch2.get(`users/${id}`);
```

## Events

- `before` Called before starting the request.

```js
this.$fetch.on("before", (request) => {
  console.log(request);
});
```

- `complete` Called when the request finishes

```js
this.$fetch.on("complete", (response) => {
  console.log(response);
});
```

- `error` Called when the request fails

```js
this.$fetch.on("error", (error) => {
  console.log(error);
});
```

## Links

* [Docs](https://github.com/andrewcaires/vue-fetch#readme)
* [GitHub](https://github.com/andrewcaires/vue-fetch)
* [npm](https://www.npmjs.com/package/@andrewcaires/vue-fetch)

## License

* [MIT License](https://github.com/andrewcaires/vue-fetch/blob/main/LICENSE)
