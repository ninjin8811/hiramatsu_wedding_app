# 開発環境構築のために

下記の README は無視して良い
apps/user_web/.env.local を開発者にもらうこと

## 構築ステップ

0. github repository の初期化

```bash
brew install gh
# arch -arm64 brew install gh
# brew upgrade gh

gh auth login
gh repo create __name__ --private
# gh repo fork --fork-name __name__

git init
git branch -M main
git remote add origin https://github.com/__username__/__name__
```

1. terraform によるインフラの整備

[terraform の README](./terraform/README.md)を参照

2. analytics の有効化(terraform 管理不可)

```bash
gcloud auth application-default login
# プロジェクトルート
bash ./scripts/add_analytics.sh
# terraformの各環境にて、vercel_envにmesurement_idを反映
terraform apply
```

3. 環境変数の出力

```bash
cd terraform environments/dev
bash ../_scripts/output_local_env.sh # web appの.envに追加する
```

4. firebase の設定

`.firebaserc`に任意の設定を登録

## よく使うコード

```bash
# firestoreのindex設定をリモートからローカルにコピー
firebase firestore:indexes > firestore.indexes.json
```
