# Current AI Feature Capabilities

The current "AI" assistant is implemented as a rule-based system within the API (`apps/api/src/modules/assistant`). It does **not** currently utilize Large Language Models (LLMs) or external AI services (like OpenAI, Anthropic, etc.).

## Implementation Details

- **Location**: `apps/api/src/modules/assistant/assistant.service.ts`
- **Type**: Keyword matching (If-Else logic)
- **Controller**: `AssistantController` exposes a POST endpoint at `/api/assistant/query`

## Supported Queries

The assistant currently supports the following types of queries based on keyword matching:

### 1. Revenue / Collection
- **Keywords**: "revenue", "collection"
- **Functionality**: Returns the total revenue collected for the current month.
- **Data Source**: Fetches KPIs from `ReportingService`.
- **Example Response**: "The total revenue collected this month is ₹1,50,000.00."

### 2. Student Count
- **Keywords**: "student" AND ("count" OR "total" OR "many")
- **Functionality**: Returns the number of active students enrolled.
- **Data Source**: Fetches KPIs from `ReportingService`.
- **Example Response**: "There are currently 120 active students enrolled."

### 3. Pending Fees
- **Keywords**: "pending", "dues"
- **Functionality**: Currently returns a placeholder message. Logic to fetch actual pending dues is not yet implemented in the assistant service.
- **Response**: "I can currently only show collected revenue. Please check the Fees Dashboard for detailed pending dues."

### 4. Fallback (Unknown Queries)
- **Functionality**: If the query does not match any of the above keywords, it returns a help message.
- **Response**: "I'm not sure about that. Try asking about 'Total Revenue', 'Student Count', or 'Pending Dues'."

## Testing
A verification script is available at `scripts/verify-ai.js` which simulates queries for:
1. Total revenue
2. Student count
3. Pending fees
4. An unknown query
