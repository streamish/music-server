# Streamish Music

Streamish is a self-hosted music server and browser interface that aims to provide compatibility with popular mobile music apps while allowing users to maintain control over their music library.

Screenshots: https://streamish.github.io

API documentation: https://streamish.github.io/api

Server: https://github.com/streamish/music-server

Web UI: https://github.com/streamish/music-webui

Docker: https://hub.docker.com/r/streamish/music

# About the Music Server

This NodeJS server indexes music files across one or more folders, for one or more users, and provides an API for accessing them that is compatible with 3rd-party mobile apps and a 1st-party web interface.

The goal of this server is to be a multi-client backend that allows everyone in your household to use their preferred music apps. It provides an off-ramp if you use Synology AudioStation or QNAP Music Station, allowing you to continue using their DS Audio and QMusic smartphone apps with your own self-hosted backend.

If you are using the [docker image](https://hub.docker.com/r/streamish/music) this server is set up automatically.

## Synology apps

- iOS: https://apps.apple.com/us/app/ds-audio/id321495303
- Android: https://play.google.com/store/apps/details?id=com.synology.DSaudio&hl=en-US
- Sideload: https://www.synology.com/en-us/support/download

## QNAP apps

- iOS: https://apps.apple.com/us/app/qnap-qmusic/id596677182
- Android: https://play.google.com/store/apps/details?id=com.qnap.qmusic
- Sideload: https://www.qnap.com/en-ca/mobile-apps/?category=entertainment

## Subsonic apps

- iOS: https://apps.apple.com/us/iphone/search?term=subsonic
- Android: https://play.google.com/store/search?q=subsonic&c=apps

## Compatibility table

| Feature               | DS Audio (Android) | DS Audio (iOS) | QMusic (Android) | QMusic (iOS) | Subsonic |
| --------------------- | ------------------ | -------------- | ---------------- | ------------ | -------- |
| Authentication        | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Browse albums         | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Browse artists        | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Browse composers      | ✅                 | ✅             | ✖️               | ✖️           | ✖️       |
| Browse genres         | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Browse songs          | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Download songs        | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Favorites / Pins      | ✅                 | ✅             | ⬜               | ⬜           | ⬜       |
| Frequently played     | ✖️                 | ✖️             | ✅               | ✅           | ✅       |
| Lyrics                | ⬜                 | ⬜             | ⬜               | ⬜           | ⬜       |
| Play downloaded songs | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Playlists             | ✅                 | ✅             | ⬜               | ⬜           | ⬜       |
| Radio                 | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Rating                | ✅                 | ✅             | ⬜               | ⬜           | ⬜       |
| Recently added        | ✅                 | ✅             | ✅               | ⬜           | ✅       |
| Share media           | ✖️                 | ✖️             | ⬜               | ⬜           | ⬜       |
| Streaming             | ✅                 | ✅             | ✅               | ✅           | ✅       |
| Top rated             | ✅                 | ✅             | ⬜               | ⬜           | ✅       |
| Trash can             | ✖️                 | ✖️             | ⬜               | ⬜           | ✖️       |

✖️ means unsupported by the app

# Configuration and setup

## Important settings to override

The default administrator account is `admin` with password `admin`. You can change the default account by setting the `DEFAULT_ADMIN_USERNAME` and `DEFAULT_ADMIN_PASSWORD` environment variables in your environment settings.

The default user account is `user` with password `user`. You can change the default account by setting the `DEFAULT_USER_USERNAME` and `DEFAULT_USER_PASSWORD` environment variables in your environment settings. Disable this account with the `DISABLE_DEFAULT_USER` environment variable if you want to use your administrator account or manage users within it.

The default library path is set with `DEFAULT_ROOT_PATH` environment variable which allows a comma-delimited string of multiple paths to be specified. You can make the music folder read-only to ensure your collection cannot be modified.

The default certificates are only used for Synology DS Audio. The docker image will automatically generate new certificates, but if you are running this server directly you should replace them yourself, eg for Linux and Mac:

```bash
$ cd certs
$ openssl genrsa -out private.pem 4096
$ openssl rsa -in private.pem -pubout -out public.pem
```

### Manually starting the server

```bash
$ git clone https://github.com/musiclib/music-server.git
$ cd music-server
$ npm ci
$ npm run build
# to run in production first set up your environment variables (see .env.localdev for example)
$ npm run sequelize:migrate
$ npm run sequelize:seed:all
$ npm run start:prod
```

## Running tests

The server uses an in-memory SQLite database for running tests with Jest. Most tests are E2E (end-to-end) tests that interact with the database and the test library through API requests.

```bash
$ npm run start:test
# in a separate terminal
$ npm run test
```

## Swagger

Swagger can be enabled for API documentation and can be accessed at `http://localhost:7000/swagger` when the server is running. The OpenAPI specification is available as JSON (`/swagger.json`) and YAML (`/swagger.yaml`).

```bash
$ SWAGGER_ENABLED=true \
  npm run start:dev
```

## Linting

The TypeScript configuration is deliberately strict, and the linting uses AirBNB's style guide as-is, complemented with import ordering and filename/folder naming conventions.

```bash
$ npm run lint
$ npm run prettier
```
