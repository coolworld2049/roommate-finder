#!/usr/bin/env sh

python -m prisma_cleanup
prisma db pull
prisma generate