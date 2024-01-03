# 3minutesNetworkingStudy

## What's this

[「3 分間ネットワーク基礎講座」シリーズ](https://www.amazon.co.jp/stores/%E7%B6%B2%E9%87%8E-%E8%A1%9B%E4%BA%8C/author/B004LUOX26?ref=ap_rdr&isDramIntegrated=true&shoppingPortalEnabled=true)でインプットした内容のアウトプットです。

主に node-fetch を使用して HTTP リクエストを行い、vitest でテストを実行します。

## Getting Started

Node.js と npm のバージョンは volta を使用して管理されています。
volta がインストールされていない場合は、[volta](https://volta.sh/) からインストールしてください。

リポジトリをクローンした後、以下のコマンドを実行して依存関係をインストールします。

```bash
npm install
```

サーバーの起動

サーバーを起動するには、以下のコマンドを実行します

```bash
npm run http-server
```

これにより、`ts-node-dev`を使用して`http/execute-server.ts`が実行され、開発中のサーバーが起動します。

テストの実行

プロジェクトのテストを実行するには、次のコマンドを使用します

```bash
npm run test
```

これにより、vitest を使用してテストスイートが実行されます。

## Appendix

- [3 分間 NetWorking](https://www5e.biglobe.ne.jp/aji/3min/)
