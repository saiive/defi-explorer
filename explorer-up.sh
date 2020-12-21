#!/bin/sh
cpu_cores=$(grep "processor" /proc/cpuinfo | wc -l) docker-compose --env-file .env.example -f docker-compose.yml up --build --force-recreate --remove-orphans --always-recreate-deps
