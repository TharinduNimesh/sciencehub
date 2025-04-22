FROM --platform=linux/arm64 oven/bun:1.2.7 as builder

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies including dev dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the Nuxt application
RUN bun run build

# Use a lightweight image for production
FROM --platform=linux/arm64 oven/bun:1.2.7-alpine

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/bun.lock /app/bun.lock

# Install only production dependencies
RUN bun install --production

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", ".output/server/index.mjs"]