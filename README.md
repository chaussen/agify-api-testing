# Agify.io API Test Suite

BDD API tests for agify.io using Cucumber and TypeScript.

## Overview

This project provides contract-based API testing for the agify.io service using a data-driven approach. The tests focus on validating API contracts, response structures, and error handling patterns rather than data accuracy. Tests are written using Behavior-Driven Development (BDD) principles with Cucumber and TypeScript.

## Prerequisites

- Node.js (v23.11.0 or higher)
- npm (v10.9.2 or higher)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd agify-api-test
```

2. Install dependencies:

```bash
npm install
```

3. Copy environment variables

```bash
cp `.env.example` `.env`
```

## Running the Tests

### Run all tests:

1. Configure environment variables: `BASE_URL`, `API_KEY` (optional)

See `.env.example` for information.

2. Run script

```bash
npm test
```

### Build the project:

```bash
npm run build
```

### Run linting:

```bash
npm run lint
```

### Format code:

```bash
npm run format
```

## Design Principles

1. **Contract-First**: Focus on API contract compliance over data accuracy
2. **Data-Driven**: Separate test data from test logic
3. **Reusable**: Generic validation utilities for consistent testing
4. **Maintainable**: Clear separation of concerns and modular design
5. **Readable**: Business-readable scenarios using Gherkin syntax

## Test Approach
### Contract-Based Testing

Tests validate that API responses conform to expected contracts:

- **Data types**: String, number, boolean validation
- **Value check**: Equal (more to be added)

========== (Future): ===================

- **Field presence**: Required vs optional fields
- **Field constraints**: Nullable, positive values, input matching

### Data-Driven Testing

Uses Cucumber scenario outlines and data tables to:

- Test multiple input combinations with single scenario definitions
- Maintain test data separately from test logic
- Enable easy addition of new test cases
- Improve test maintainability and readability

### Test Coverage

The test suite covers the following areas:

1. **Single Name Contract Validation**
   - Multiple name variations (common, special chars, long names)
   - Response field validation

2. **Country-Specific Contract Validation**
   - Valid country codes
   - Invalid country handling

3. **Batch Request Contract Validation**
   - Array response structure
   - Individual item validation
   - Consistent field contracts

4. **Error Handling Contract Validation**
   - Invalid request scenarios
   - Error response structure
   - Consistent error messaging

## API Endpoints Tested

- **Base URL**: `https://api.agify.io`
- **Single name**: `GET ?name={name}`
- **Multiple names**: `GET ?name[]={name1}&name[]={name2}`
- **With country**: `GET ?name={name}&country_id={country}`
- **With API Key**: `GET ?name={name}&country_id={country}&apiKey={apiKey}`


## Test Reports

After running tests, reports are generated in the `reports/` directory:

- `cucumber-report.json`: JSON format report
- `cucumber-report.html`: HTML format report

## Other Enhancements Considered
- **Retry Logic:** Implement exponential backoff for transient failures
- **Timeout Configuration:** Set appropriate timeouts for different test environments
- **Health Checks:** Verify API availability before running test suites

## Project Structure

```
├── features/
│   └── agify-api.feature          # BDD feature file with contract-based scenarios
├── src/
│   ├── steps/
│   │   └── agify-steps.ts         # Step definitions for Cucumber
│   └── utils/
│       ├── api.ts                 # API client utility
│       └── validator.ts           # Validation utilities
│       └── debug.ts               # Debug utilities
├── reports/                       # Test reports (generated)
├── cucumber.js                    # Cucumber configuration
├── eslint.config.mjs              # Lint configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project dependencies and scripts
└── README.md                      # This file
```

## Problems Encountered and Solutions

### 1. API Rate Limiting - Daily Quota Exhaustion
**Problem:** The free tier of agify.io API has a 100 requests/day limit, which is quickly reached during test development and execution.

**Impact:** 
- Test failures due to quota exceeded errors
- Inability to run full regression suites regularly

**Desired Outcome & Solutions:**
- **Pipeline Configuration:** Configure CI/CD pipelines to run a limited subset of tests (e.g., 20-30 requests max per run)
- **Test Prioritization:** Use Cucumber tags to selectively run critical scenarios in automated pipelines
- **Staging Strategy:** Use different API keys for different environments to distribute quota usage
- **Paid Plans:** Money

**Implementation:**
```typescript
// Add to environment config
MAX_DAILY_REQUESTS=30
CURRENT_REQUEST_COUNT=0

// Track requests in test runner
if (process.env.CURRENT_REQUEST_COUNT >= process.env.MAX_DAILY_REQUESTS) {
  console.warn('⚠️  Daily request limit reached. Skipping remaining tests.');
  return;
}
```

### 2. Account-Specific Error Scenarios Testing
**Problem:** Testing account-specific error conditions (inactive subscription, limit reached, limit too low) is challenging because these states depend on the actual agify.io account status.

**Scenarios Difficult to Test:**
- `HTTP 402` - Payment required
- `HTTP 429` - Request limit reached
- `HTTP 429` - Request limit too low to process request

**Desired Outcome & Solutions:**

**Option 1: Multiple Test Accounts**
- **Inactive Subscription Account:** Maintain a test account with expired subscription
- **Quota Exhausted Account:** Dedicated account that regularly hits daily limits
- **Different Tier Accounts:** Accounts with various subscription levels for testing tier-specific behavior

**Option 2: API Mocking (Recommended)**
- **Mock Server:** Implement mock responses for account-specific error scenarios
- **Test Data:** Create fixtures for different error response types
- **Integration Tests:** Use real API for happy path, mocks for error scenarios

**Implementation Example:**
```typescript
// Mock different account states
const mockResponses = {
  quotaExceeded: { 
    status: 429, 
    body: { error: "Request limit exceeded" } 
  },
  inactiveSubscription: { 
    status: 402, 
    body: { error: "Subscription is not active" } 
  },
  invalidApiKey: { 
    status: 429, 
    body: { error: "Request limit too low to process request" } 
  }
};

// Use in test scenarios
@mock-server
Scenario: Handle quota exceeded error
  Given the API returns quota exceeded response
  When I request age prediction for name "john"
  Then I should receive a 429 status code
  And the error message should contain "Request limit exceeded"
```