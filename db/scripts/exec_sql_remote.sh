#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

POSTGRES_CUSTOM_PASSWORD=${POSTGRES_CUSTOM_PASSWORD}
POSTGRES_CUSTOM_HOST=aws-0-eu-central-1.pooler.supabase.com \
POSTGRES_CUSTOM_PORT=5432 POSTGRES_CUSTOM_USER=postgres.ypzicolqbszcdwceoiop \
POSTGRES_CUSTOM_PASSWORD=${POSTGRES_CUSTOM_PASSWORD} bash $SCRIPT_DIR/exec_sql.sh