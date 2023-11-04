# Discord-Rigate

## Overview

Discord botとしてRSS通知を行うことができる、Node用アプリケーションです。
起動時から1日分を遡り、更新があった記事をDiscordの指定したチャンネルに送信します。
サービスとしては提供していないため、必要に応じて環境を用意してデプロイしてください。

基本的にCloud Functionsで定時実行することを想定して作成してあります。  
Lambdaなどで使用する場合は、適宜コードを書き換えてください。

## 主要ライブラリ

主に以下のライブラリを使用しています...

- discord.js
- rss-parser

## Discord botの設定

Discord Developper Portalから、botの設定が必要です。まずApplicationを作成します。  
**OAuth2** の設定を開き、URL Generatorから、以下の権限をONにします。

- `Scopes -> bot`
- `Bot Permissions -> General Permissions -> Read Messages/View Channnels`
- `Bot Permissions -> Text Permissions -> Send Messages`

URLを生成したら、当該URLにアクセスしてサーバに導入します。
その後Developer PortalのBotの欄を開き、Tokenを生成してください。この値を環境変数に入れます。

botのtokenを生成したら、.envに `DISCORD_BOT_TOKEN` を追記してください(.env.example参照)  
Cloud Functionを使う場合は、同じようにランタイム環境変数を追加してください。

## rss.jsonの設定

rss.jsonのオプションは以下の通りです。

- `"title"`
  - そのWebサイトの任意のタイトルです。チャンネル投稿時に使用されます。
- `"rss"`
  - RSSのアドレス
- `"version"`
  - RSSのバージョン (`1` or `2`)
- `"channelId"`
  - 投稿先のDiscordのチャンネルIDです。開発者モードをONにして、チャンネル名を右クリックするとIDがコピーできます。
- `"bannedWords" (array)`
  - 記事のタイトルにここで指定したワードが含まれていた場合、その記事は無視します。

## セットアップ (分かる人向け)

Node 20.6.0以前にも対応するため、dotenvを導入してあります。

1. Discord botのセットアップ（Botの権限関係や、キーの生成など）
1. `yarn install`
1. `yarn build` で Parcelを使ってbundleを作る
1. `./rss.json` の編集

**Optional (Cloud Functions向けの設定)**
1. `gcloud` コマンド等を使用してCloud Functionsにデプロイ
1. Cloud Schedulerの設定を `0 10 * * *` のように、回したい時間に合わせる
1. 必要に応じてIAMの設定

## 注意事項

本ソフトウェアを使用することによって発生した損害・損失に対し作者は一切の責任を負いません。