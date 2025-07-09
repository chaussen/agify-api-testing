@agifyApi
Feature: Agify API Contract Testing
  As an API Tester of agify.io
  I want to ensure the API contract is valid
  So that agify.io can handle responses correctly

  Background:
    Given the agify API is available at base url

  @status200
  Scenario Outline: Estimating the age of a single common name
    When I request age estimation for name "<name>" with "DEFAULT" country:
    Then the response status should be <status>
    And the response should match the expected contract:
      | field | validation | expected |
      | name  | equal      | <name>   |
      | age   | is         | number   |
      | count | is         | number   |

    @common
    Examples:
      | name    | status | description      |
      | michael | 200    | common name      |
      | a       | 200    | single character |

  @status200
  Scenario Outline: Estimating the age of a single uncommon name
    When I request age estimation for name "<name>" with "DEFAULT" country:
    Then the response status should be <status>
    And the response should match the expected contract:
      | field | validation | expected |
      | name  | is         | string   |
      | age   | is         | null     |
      | count | is         | number   |

    @uncommon
    @fallback
    Examples:
      | name                                                            | status | description        |
      | 冏                                                              | 200    | special characters |
      | veryloooooooooooooooooooooooooooooooooooooooooooooooooooongname | 200    | long name          |
      | john123                                                         | 200    | alphanumeric       |
      |                                                                 | 200    | empty              |
      | %20                                                             | 200    | whitespace         |

  @status200
  Scenario Outline: Valid name and country combination contract validation
    When I request age estimation for name "<name>" with "<country>" country:
    Then the response status should be <status>
    And the response should match the expected contract:
      | field | validation | expected |
      | name  | equal      | <name>   |
      | age   | is         | number   |
      | count | is         | number   |

    @common
    Examples:
      | name    | country | status | country_required | description   |
      | michael | US      | 200    | true             | valid country |
      | sarah   | AU      | 200    | true             | valid country |


  @status200
  Scenario Outline: Invalid name and country combination contract validation
    When I request age estimation for name "<name>" with "<country>" country:
    Then the response status should be <status>
    And the response should match the expected contract:
      | field | validation | expected |
      | name  | is         | string   |
      | age   | is         | null     |
      | count | is         | number   |

    @uncommon
    @fallback
    Examples:
      | name        | country | status | description                 |
      | diakritikós | AU      | 200    | valid country, invalid name |
      # diacritic will be removed and then processed as "diakrdiakritik%C3%B3sitikos"
      | anna        | XX      | 200    | invalid country             |



  @status200
  Scenario: Batch request contract validation
    When I request age predictions for the following names with "DEFAULT" country:
      | name  |
      | john  |
      | david |
    Then the response status should be 200
    And the response should be an array with 2 items
    And each array item should match the expected contract:
      | field | validation | expected |
      | name  | is         | string   |
      | age   | is         | number   |
      | count | is         | number   |

  @negative
  Scenario Outline: Error response validation
    When I make an invalid request with "<invalid_input>"
    Then the response status should be <expected_status>
    And the response should match the expected contract:
      | field | validation | expected         |
      | error | equal      | <expected_error> |

    Examples:
      | invalid_input   | expected_status | expected_error           | description              |
      | no_params       | 422             | Missing 'name' parameter | missing name parameter   |
      | invalid_api_key | 401             | Invalid API key          | unauthorized invalid key |
# | error_402_param     | 402             | Subscription is not active               | 402 via query parameter        |
# | error_429_param     | 429             | Request limit reached                    | 429 via query parameter        |
# | error_429_low_param | 429             | Request limit too low to process request | 429 low limit via query param  |