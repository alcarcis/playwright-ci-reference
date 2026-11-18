# Demo shop (system under test) as a container image: used by the performance job in CI.
# Zero runtime dependencies, so the image is only Node plus the app.
FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /srv
COPY app ./app

# Never run as root.
USER node
EXPOSE 3100

# Credentials are injected at run time (APP_USER / APP_PASSWORD); nothing secret lives in the image.
HEALTHCHECK --interval=5s --timeout=3s --start-period=3s --retries=5 \
  CMD node -e "fetch('http://localhost:3100/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "app/server.js"]
