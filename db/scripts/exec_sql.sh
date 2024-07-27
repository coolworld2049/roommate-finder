#!/usr/bin/env bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

source $SCRIPT_DIR/../.env

psql_args="-h ${POSTGRES_CUSTOM_HOST:-localhost} -p ${POSTGRES_CUSTOM_PORT:-5432} -U ${POSTGRES_CUSTOM_USER:-postgres} -d ${POSTGRES_CUSTOM_DB:-postgres}"

POSTGRES_PASSWORD=${POSTGRES_CUSTOM_PASSWORD:-$POSTGRES_PASSWORD}
export PGPASSWORD=${POSTGRES_PASSWORD}

cat $SCRIPT_DIR/../sql/drop_all.sql  $SCRIPT_DIR/../sql/extensions.sql $SCRIPT_DIR/../sql/schema.sql $SCRIPT_DIR/../sql/policies.sql $SCRIPT_DIR/../sql/dml.sql | PGPASSWORD=${POSTGRES_PASSWORD} psql $psql_args -f -
cat $SCRIPT_DIR/../sql/data/amenities.csv | psql $psql_args -c "\copy amenities(name,icon_svg,category) FROM STDIN with (format csv,header true, delimiter ',');"
cat $SCRIPT_DIR/../sql/data/interest_areas.csv | psql $psql_args -c "\copy interest_areas(name,icon_svg) FROM STDIN with (format csv,header true, delimiter ',');"
cat $SCRIPT_DIR/../sql/data/specialties.csv | psql $psql_args -c "\copy higher_education_specialties(code,area,qualification) FROM STDIN with (format csv,header true, delimiter ',');"
