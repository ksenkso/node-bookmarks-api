# Rest Api Node and Mysql

## Description
This repo is based on [this setup](https://github.com/brianschardt/node_rest_api_mysql) and [this acticle](https://codeburst.io/build-a-rest-api-for-node-mysql-2018-jwt-6957bcfc7ac9). 
##### Routing         : Express
##### ORM Database    : Sequelize
##### Authentication  : Passport, JWT

## Installation

#### Download Code | Clone the Repo

```
git clone {repo_name}
```

#### Install Node Modules
```
npm install
```

#### Create .env File
This is the example
```
APP=dev
PORT=3000

DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bookmarks_node
DB_USER=root
DB_PASSWORD=
JWT_ENCRYPTION=PleaseChange
JWT_EXPIRATION=10000
```

