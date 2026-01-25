#!/bin/bash
DB_URL="https://yes-ai-cms-haysan10.aws-us-west-2.turso.io"
# Token provided by user
AUTH_TOKEN="eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJleHAiOjE3NzQ1NjM1NDEsImlhdCI6MTc2OTM3OTU0MSwiaWQiOiJhYTcxMDQ5Mi00ZGUyLTRmYjAtOTg5Ny1kNTViMTExNGMzMGYiLCJyaWQiOiJlZTE1OTIwYi0wMzIwLTQ1NjctYTAzNC1mODE4NzJiZDVlNWEifQ.Jzrh0WMCvUHaTMiDo4b5aKmquexurkSowY_6LT7Gk-Eu43oTiH41HI5IEB7wavkTLEIppMDM4uDEaNAlTngHDA"

echo "Testing connection to $DB_URL via CURL..."

curl -s -X POST "$DB_URL/v2/pipeline" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requests": [
      {
        "type": "execute",
        "stmt": {
          "sql": "SELECT 1"
        }
      }
    ]
  }'

echo ""
