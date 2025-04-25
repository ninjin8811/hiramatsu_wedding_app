## 構築ステップ

0. github repositoryの初期化

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

1. terraformによるインフラの整備

[terraformのREADME](./terraform/README.md)を参照


2. analyticsの有効化(terraform管理不可)

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

4. firebaseの設定

`.firebaserc`に任意の設定を登録


## よく使うコード
```bash
# firestoreのindex設定をリモートからローカルにコピー
firebase firestore:indexes > firestore.indexes.json
```