# Use an official Bun image
FROM oven/bun:latest

# Set working directory inside the container
WORKDIR /app

# Copy the package and lock files
COPY bun.lockb package.json tsconfig.json vite.config.ts ./

# Install dependencies
RUN bun install

# Copy the rest of the application files
COPY . .

# Expose the port that Vite uses (default: 5173)
EXPOSE 5173

# Start the Vite development server
CMD ["bun", "run", "host"]
