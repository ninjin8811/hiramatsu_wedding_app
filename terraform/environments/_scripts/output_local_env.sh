# require jq
# ENV_から始まるoutputをENV_を省きつつ.env.localに書き出す

terraform output -json \
| jq -r '
  to_entries
  | map(select(.key | startswith("ENV_")))
  | map("\(.key | ltrimstr("ENV_"))=\(.value.value)")
  | .[]
' > .env.local