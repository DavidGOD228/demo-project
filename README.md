# WILSON Backend App

## Prerequisites

You must have the following installed:

* [Node.js v14.17.6](https://nodejs.org/en/download/)
* NPM v6+ (comes installed with newer Node versions)

## Environment variables 
 - WILSON_BE_PORT 
 - WILSON_DB_HOST
 - WILSON_DB_PORT
 - WILSON_DB_USERNAME
 - WILSON_DB_PASSWORD
 - WILSON_DB_DBNAME

## Install Dependencies

Run `npm install` to install all dependencies from NPM.

## Database

```bash
# start database and services
$ docker-compose up -d
```

## Start an application

```bash
# start API
$ npm run start:dev
```