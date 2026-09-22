#!/bin/bash

# Required environment variables:
# STACK_NAME (e.g. ltc-admission-test)
# IMAGE_TAG (e.g. test)
# BACKEND_PORT (e.g. 3002)
# FRONTEND_PORT (e.g. 5174)
# REGISTRY_URL
# DATABASE_URL
# JWT_SECRET
# FRONTEND_URL
# GEMINI_API_KEY
# SLIPOK_API_KEY
# SLIPOK_BRANCH_ID

echo "🚀 Deploying stack: $STACK_NAME with tag: $IMAGE_TAG"

# Write environment variables to .env for docker-compose
cat <<EOF > .env.$STACK_NAME
COMPOSE_PROJECT_NAME=$STACK_NAME
IMAGE_TAG=$IMAGE_TAG
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
REGISTRY_URL=$REGISTRY_URL
DATABASE_URL=$DATABASE_URL
JWT_SECRET=$JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
GEMINI_API_KEY=$GEMINI_API_KEY
SLIPOK_API_KEY=$SLIPOK_API_KEY
SLIPOK_BRANCH_ID=$SLIPOK_BRANCH_ID
EOF

# Ensure uploads directory exists on the host
mkdir -p uploads

# Pull the latest images
docker compose --env-file .env.$STACK_NAME pull

# Restart the containers
docker compose --env-file .env.$STACK_NAME up -d --remove-orphans

# Remove dangling images (old untagged images left after pull)
docker image prune -f

echo "✅ Deployment successful for $STACK_NAME"
