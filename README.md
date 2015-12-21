[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

# AngelAppBase

This is an example of an application using the api appbase.io data stream, where it performs work on the side backend to insert data into appbase.io by Angel API at specific intervals and then using continuous queries React the app to compose the picture and allow filtering of job opportunities by country/cities.

## To use

The view files are available in the public folder  `public/` and REST requests are in `/api/` where you can get all the data. To start a server node must be done as follows:

### Bower

```sh
bower install
```

### Node

```sh
npm install
node server.js
```

And visit <http://localhost:3000/>.

## Changing the port

You can change the port number by setting the `$PORT` environment variable before invoking the script above, e.g.,

```sh
PORT=3001 node server.js
```