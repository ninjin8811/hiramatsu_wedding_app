#!/usr/bin/env bash

# ----------------------------------------------------------
# このスクリプトは Firebase Management API を利用して、
# Firebaseに Google アナリティクスアカウントを接続し、
# Analyticsを有効化します。
#
# 前提:
#   - gcloud CLI がインストール済み
#   - gcloud auth application-default login で認証を済ませている
#   - Google APIs の使用に必要な権限がある
# ----------------------------------------------------------

# 1. ユーザーに入力を促す
read -p "Enter the Firebase Project ID: " PROJECT_ID
read -p "Enter the Analytics Account ID: " ANALYTICS_ACCOUNT_ID

echo "You are about to connect Project \"${PROJECT_ID}\" with Analytics account \"${ANALYTICS_ACCOUNT_ID}\"."
echo

# API エンドポイント
ENDPOINT="https://firebase.googleapis.com/v1beta1/projects/${PROJECT_ID}:addGoogleAnalytics"

# リクエストボディ
# analyticsAccountId に有効なアナリティクスアカウント ID を指定します
REQUEST_BODY="$(cat <<EOS
{
  "analyticsAccountId": "${ANALYTICS_ACCOUNT_ID}"
}
EOS
)"

# curlでAPI呼び出し
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json" \
  -d "${REQUEST_BODY}" \
  "${ENDPOINT}"

echo
echo "=== Request finished. Check the response above. ==="