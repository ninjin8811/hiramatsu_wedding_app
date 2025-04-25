##　管理内容

- firebase
  - firestore
  - storage
  - functions
  - authentication

## 初期構築

### gcpへのログイン

```bash
gcloud auth application-default login
gcloud config set project firelaunch
```


### 環境に依存しないインフラの構築


- vercel

`./environments/common/terraform.tfvars` を編集

```bash
terraform init
terraform plan
terraform apply -auto-approve
```


### 各環境毎のインフラを構築 (./encironments/_env_)

`./environemnts/(env)/terraform.tfvars` を編集
`./environemnts/(env)/main.tf` のbackend > prefixを編集

```bash
terraform init
terraform plan
terraform apply -auto-approve
```
  
## インフラ構成の変更


```bash
terraform init # 初回のみ
terraform plan
terraform apply
```