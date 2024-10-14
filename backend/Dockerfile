# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy the package and lock files
COPY bun.lockb package.json tsconfig.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application files
COPY . .

# Expose the port your Express API will run on (default: 3000)
EXPOSE 8000

# Run the API using 'bun dev'
CMD ["bun", "run", "dev"]