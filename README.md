# 即売キオスク

同人即売会ブース向けの Web アプリです。  
来場者用のタッチパネルキオスクと、サークル向けの管理画面（頒布物 CRUD・在庫・受け渡し）を提供します。

## 機能

- **キオスク** … 頒布物一覧・詳細・カート・受け取り番号発行
- **管理画面** … 売上サマリー、頒布物の追加／編集／削除、受け渡し状態の更新
- **API** … Spring Boot REST + MySQL（注文時に在庫を減算）

## 技術スタック

| 区分 | 内容 |
|------|------|
| フロント | React 18（CDN）、HTML/CSS、Hash ルーティング |
| バックエンド | Java 21、Spring Boot 3.3、Spring Data JPA |
| DB | MySQL 8.4 |
| 実行環境 | Docker Compose |

## アクセス

| 画面 | URL |
|------|-----|
| キオスク | http://localhost:8080/ |
| 管理 | http://localhost:8080/#/admin |

## ディレクトリ構成

```
/
├── README.md
└── app/
    ├── docker-compose.yml
    ├── backend/         … Spring Boot（API・静的ファイル配信）
    └── kiosk/           … React フロント（ビルド時に JAR に同梱）
```

## API

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/api/items` | 頒布物一覧 |
| GET | `/api/items/{id}` | 頒布物 1 件 |
| POST | `/api/items` | 頒布物作成 |
| PUT | `/api/items/{id}` | 頒布物更新 |
| DELETE | `/api/items/{id}` | 頒布物削除 |
| POST | `/api/orders` | 注文（在庫減算） |
| GET | `/api/orders` | 注文一覧 |
| PUT | `/api/orders/{id}/toggle-status` | 受け渡し状態の切替 |

## 補足

- カートはブラウザの `localStorage` に保持し、確定時に `/api/orders` へ送信します。
- 初回起動時、頒布物が空の場合はサンプルデータが投入されます。
