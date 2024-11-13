# my-nuxt-app

## Build Setup

```bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Special Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `assets`

The assets directory contains your uncompiled assets such as Stylus or Sass files, images, or fonts.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/assets).

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/components).

### `layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).


### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).


### デプロイコマンド
- デプロイ
```
fly deploy 
```

- DB作成
```
flyctl postgres create  
```

- DB接続
```
fly postgres connect -a [DBインスタンス名]
```

DB作成時のユーザ名、パスワードなどを設定する。

- 環境変数設定
```
fly secrets set HOST_URL=[デプロイ後のURL]
fly secrets set SOCKET_URL=[デプロイ後のURL]
fly secrets set API_URL=[デプロイ後のURL]
fly secrets set DB_HOST=[ホスト名] 
fly secrets set DB_USER=[ユーザ名]
fly secrets set DB_PASSWORD=[パスワード] 
fly secrets set DB_NAME=[データベース名]
fly secrets set DB_PORT=[ポート番号]
fly secrets set DB_CONNECT_STRING=[接続文字列]
```

### SQL

```
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY, -- 注文ID
    order_number BIGINT, -- 注文番号
    takoyaki_quantity INT, -- たこ焼きの注文個数
    takoyaki_price INT, -- たこ焼きの売価
    dessert_takoyaki_quantity INT, -- デザートたこ焼きの注文個数
    dessert_takoyaki_price INT, -- デザートたこ焼きの売価
    order_date TIMESTAMP, -- 注文日時
    status TEXT CHECK (status IN ('preparing', 'completed')) DEFAULT 'preparing', -- 受け渡し状況（調理中または受け渡し済み）
    pass_date TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日
);



CREATE TABLE pricesettings (
    takoyaki_price INT DEFAULT 300, -- たこ焼きの売価
    dessert_takoyaki_price INT DEFAULT 200, -- デザートたこ焼きの売価
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 更新日
);



INSERT INTO pricesettings (takoyaki_price, dessert_takoyaki_price) VALUES (300, 200);
```
