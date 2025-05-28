FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Install Playwright browsers
RUN npx playwright install chromium

# Set environment variables
ENV CI=true

# Command to run tests
CMD ["npx", "playwright", "test"]
