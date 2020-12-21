#!/bin/sh
docker stop $(docker ps -q) 2> /dev/null
docker container prune -f
docker network prune -f
#docker volume prune -f
#docker image prune -af
#docker system prune -af
