# Testing DocSpace with Playwright

This project contains automated tests for ONLYOFFICE DocSpace using Playwright test framework.

## Prerequisites

- Node.js (latest LTS version recommended)
- npm (comes with Node.js)
- Playwright Test Framework

## Installation

1. Clone the repository
2. Install dependencies: `npm install`

## Environment Configuration

1. Create a `.env` file in the root directory of the project
2. Contact the repository maintainers to obtain the required environment variables and their values
3. Add these variables to your `.env` file

## Running Tests

### Local Execution

These commands will run tests locally on your machine:

- Run all tests: `npm test`
- Run UI tests only: `npm run test:ui`
- Run API tests only: `npm run test:api`

### Docker Execution

You can also run tests in a Docker container to ensure consistent environments:

- Build and run tests using Docker Compose:
  ```bash
  docker-compose up --build
  ```

- Run with specific test files:
  ```bash
  docker-compose run e2e-tests npx playwright test src/tests/site/login-page.spec.ts
  ```

- Open the HTML report after running tests:
  ```bash
  docker-compose run e2e-tests npx playwright show-report
  ```

### Regional Testing

- Run tests in EU region: `npm run test:eu`
- Run tests in US region: `npm run test:us`

### Production Testing

- Run production tests: `npm run test:prod`

## Code Quality

Run linting:
`npm run lint`

## Git Workflow

### Creating a New Branch

1. Update your main branch:
   `git checkout main`
   `git pull origin main`

2. Create a new branch:
   `git switch -c your-branch-name`

### Working with Changes

1. Make your changes and stage them:
   `git add .`

2. Commit your changes with a descriptive message:
   `git commit -m "type: brief description of changes"`

3. Push your branch:
   `git push origin your-branch-name`

4. Create a pull request
