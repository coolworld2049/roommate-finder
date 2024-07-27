#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

source $SCRIPT_DIR/../.env

DB_URL=postgres://postgres:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB

BASE_DIR="$SCRIPT_DIR"/../dumps

[ -d $BASE_DIR ] || mkdir $BASE_DIR

supabase db dump --data-only  --db-url $DB_URL > $BASE_DIR/public.schema.sql