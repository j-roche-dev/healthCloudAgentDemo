# Health Cloud Agentforce Demo - AI Account Summaries

> **Salesforce Health Cloud + Agentforce Integration**
> AI-powered account summaries that analyze customer relationships, sales pipeline, and support history

---

## Outstanding Action Items

### 1. Resolve LWC Button Flow Invocation Error
**Current Issue:** The "Generate Summary" button in the `accountSummaryAccordion` LWC component experiences intermittent errors when triggering the `Run_Eigen_X_Account_Summary` flow.

**Technical Details:**
- **Error Location:** `accountSummaryAccordion.js:115` - flow invocation
- **Root Cause:** Potential timing issue where `recordId` is not fully initialized when the component first renders
- **Current Debug Logging:** Extensive console logging added to track `recordId` lifecycle through getter/setter, `connectedCallback`, and `renderedCallback`
- **Symptoms:** Flow may not start, or starts with undefined `accountId` input variable

**Resolution Steps:**
1. Verify the `recordId` is consistently available when the component is placed on Account record page
2. Add defensive null/undefined checks before flow invocation
3. Consider adding a user-facing error toast notification if flow fails to start
4. Test with both empty state (no summaries) and existing summaries scenarios
5. Validate Lightning Flow component is properly initialized before calling `startFlow()`

**Acceptance Criteria:**
- Button reliably triggers flow 100% of the time
- Clear error messaging if flow cannot be started
- No console errors in browser developer tools

---

### 2. Create Agentforce Default Agent Action for Direct Flow Invocation
**Objective:** Enable Agentforce conversational AI to generate account summaries directly through natural language commands.

**Technical Requirements:**
- **Agent Action Type:** Flow-based Agent Action
- **Target Flow:** `Run_Eigen_X_Account_Summary`
- **Action Name:** "Generate Account Summary" or "Create Account Analysis"
- **Description:** "Analyzes an Account's relationships, sales pipeline, and support history to generate a comprehensive AI-powered summary"
- **Input Parameters:**
  - `accountId` (required) - String - The Salesforce Account ID to summarize
  - Should support context-aware invocation (e.g., "summarize this account" when viewing an Account record)

**Implementation Steps:**
1. Create new Agent Action in Setup → Agent Actions
2. Configure action to invoke `Run_Eigen_X_Account_Summary` flow
3. Map input parameter `accountId` to the flow's `accountId` variable
4. Add natural language variations for invocation:
   - "Generate a summary for this account"
   - "Create an account analysis"
   - "Summarize the customer relationship"
   - "Give me an overview of this account"
5. Test action within Agentforce chat interface
6. Configure action permissions for appropriate user profiles/permission sets

**Integration Points:**
- Should work within Einstein Copilot or Agentforce chat
- Action should return confirmation when summary is created
- Consider adding output parameter to return summary content directly in conversation

**Acceptance Criteria:**
- Agent action appears in Agentforce action library
- Action successfully invokes flow with correct Account ID from context
- Natural language commands reliably trigger the action
- Summary is created and saved to `Account_Summary__c` object
- User receives confirmation message with link to view summary

---

### 3. Create Comprehensive Demo Data for Eigen X Demonstration
**Objective:** Populate the Health Cloud org with realistic, scenario-driven data that showcases the AI summary capabilities across diverse account situations.

**Data Scenarios to Create:**

#### Scenario A: High-Value Customer with Active Pipeline
- **Account:** "HealthFirst Medical Group" (Hospital network)
- **Opportunities:**
  - 3-4 open opportunities totaling $500K+ (various stages)
  - 2 closed-won opportunities ($200K-$300K each) from past 12 months
  - 1 closed-lost opportunity with detailed reason
- **Cases:**
  - 2-3 low-priority resolved cases (basic support questions)
  - 1 medium-priority open case (feature request)
- **Expected Summary Highlights:** Strong relationship, healthy pipeline, minimal support issues

#### Scenario B: At-Risk Customer with Support Escalations
- **Account:** "Community Care Partners" (Small practice group)
- **Opportunities:**
  - 1 large opportunity ($150K) stalled in negotiation stage for 60+ days
  - 1 recent closed-lost opportunity
- **Cases:**
  - 2 high-priority open cases (system errors/integration issues)
  - 1 escalated case with detailed description
  - Multiple closed cases showing pattern of technical issues
- **Expected Summary Highlights:** Risk factors, support burden, stalled pipeline

#### Scenario C: New Prospect with Growing Interest
- **Account:** "Wellness Solutions Inc" (New healthcare startup)
- **Opportunities:**
  - 1-2 early-stage opportunities (Discovery/Qualification)
  - Small deal sizes ($25K-$50K)
- **Cases:**
  - 0-1 cases (pre-sales questions only)
- **Expected Summary Highlights:** New relationship, expansion potential, minimal history

#### Scenario D: Mature Customer with Renewal Opportunity
- **Account:** "Regional Health Systems" (Long-term enterprise customer)
- **Opportunities:**
  - 1 large renewal opportunity ($400K) closing in 30 days
  - Multiple historical closed-won deals
  - 1 expansion opportunity in early stage
- **Cases:**
  - Mix of resolved cases across various priorities
  - Primarily feature requests and optimization questions
  - No critical open issues
- **Expected Summary Highlights:** Long-term partnership, renewal focus, stable relationship

**Implementation Checklist:**
- [ ] Create 4 Account records with complete field data (Industry, Type, Revenue, etc.)
- [ ] Populate 10-15 Opportunity records across all stages
- [ ] Create 15-20 Case records with realistic subjects, descriptions, and close summaries
- [ ] Use SDO custom fields if available (e.g., `SDO_Service_Close_Summary__c`, `SDO_Sales_Closed_Won_Value__c`)
- [ ] Vary Created Date and Close Date to show relationship timeline
- [ ] Include realistic Next Steps, Descriptions, and Close Summaries
- [ ] Test each scenario by generating AI summary and validating output quality

**Data Loading Method:**
- Option 1: Manual entry through Salesforce UI (good for understanding relationships)
- Option 2: Data Loader with CSV files (faster for bulk data)
- Option 3: Apex anonymous script or test data factory class
- Option 4: Salesforce CLI `sf data create record` commands

---

### 4. Write Comprehensive Demo Script for Salesforce Actions
**Objective:** Create a step-by-step demo script that showcases the AI Account Summary feature in a compelling, business-value-focused narrative.

**Script Structure:**

#### Introduction (2 minutes)
- **Setup:** Navigate to Account record page with no existing summaries
- **Business Context:** "As a sales manager or customer success leader, understanding the full picture of your accounts is critical but time-consuming..."
- **Pain Points to Highlight:**
  - Manually reviewing opportunities, cases, and account history across multiple screens
  - Inconsistent account reviews across team members
  - Missing key risks or opportunities buried in data
  - Time-consuming prep for customer meetings

#### Demo Flow (5-7 minutes)

**Part 1: First Summary Generation**
1. Show Account record page with empty state component
2. Highlight the prompt: "No Account Summaries Yet - Generate an AI-powered summary to get insights"
3. Click "Generate Account Summary" button
4. While processing (show spinner), explain what's happening behind the scenes:
   - AI is analyzing account details
   - Reviewing all related opportunities (pipeline, closed deals, losses)
   - Examining support case history and patterns
   - Identifying risks and opportunities
5. When complete, walk through generated summary section by section:
   - **Account Overview** - Clear business context
   - **Relationship & History** - How long we've worked together
   - **Sales Pipeline & Revenue** - Current opportunities and patterns
   - **Support & Cases** - Support health and any red flags
   - **Key Risks & Opportunities** - Actionable insights
   - **Recommended Next Steps** - Specific actions to take

**Part 2: Multi-Account Comparison**
1. Navigate to second account (different scenario - e.g., at-risk customer)
2. Generate summary
3. Compare and contrast:
   - First account: healthy, growing
   - Second account: at-risk, needs attention
4. Highlight how AI identifies different patterns and provides context-specific recommendations

**Part 3: Historical Summaries**
1. Return to first account
2. Generate a second summary (simulating a follow-up after 30 days)
3. Show accordion interface with multiple summaries
4. Click between summaries to show timeline
5. Explain use case: "Track account health over time, see how relationships evolve"

**Part 4: Agent Action Integration** (once implemented)
1. Open Agentforce chat/Einstein Copilot
2. Type natural language command: "Summarize this account"
3. Show how agent action triggers the same flow
4. Highlight conversational AI capabilities
5. Demonstrate follow-up questions about the summary

#### Business Value Conclusion (2 minutes)
- **Time Savings:** "Instead of 30 minutes reviewing records, you have instant insights"
- **Consistency:** "Every account review follows the same comprehensive framework"
- **Proactive Management:** "AI identifies risks and opportunities you might miss"
- **Better Outcomes:** "Spend less time researching, more time building relationships"

**Technical Notes for Presenter:**
- Ensure demo data is populated before presentation
- Test all scenarios in advance
- Have browser console open (hidden) to troubleshoot any flow errors
- Prepare backup accounts if live generation fails
- Clear any old summaries if showing "first time" experience

**Demo Variations:**
- **Executive Audience:** Focus on business value, ROI, strategic insights (skip technical details)
- **Admin Audience:** Show configuration, flow architecture, customization options
- **Sales Team:** Emphasize time savings, pipeline insights, next actions
- **Support Team:** Highlight case analysis, risk identification, proactive service

---

## System Overview

### What This Project Does

This Salesforce Health Cloud solution uses **Agentforce AI** to automatically generate comprehensive, business-friendly account summaries. The system analyzes Account data along with related Opportunities and Cases, then produces structured insights about customer relationships, sales pipeline health, support history, risks, opportunities, and recommended next actions.

### Business Value

- **Accelerates Account Planning:** Replace 30+ minutes of manual research with instant AI-generated insights
- **Improves Decision Quality:** AI identifies patterns, risks, and opportunities across complex relationship data
- **Ensures Consistency:** Every account review follows the same comprehensive analytical framework
- **Scales Account Management:** Enable teams to deeply understand more accounts in less time
- **Enhances Customer Engagement:** Sales and service teams arrive at meetings fully prepared with current context

---

## Architecture & Components

### System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User Action: Click "Generate Summary" Button                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Lightning Web Component (accountSummaryAccordion)              │
│  • Displays existing summaries in accordion UI                  │
│  • Triggers flow with Account ID                                │
│  • Handles flow lifecycle (running/finished/error)              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Orchestration Flow (Run_Eigen_X_Account_Summary)              │
│  • Retrieves Account record                                     │
│  • Invokes Prompt Template with Account context                 │
│  • Saves generated summary to Account_Summary__c               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Prompt Template (Eigen_X_Account_Summary)                      │
│  • Type: einstein_gpt__recordSummary                           │
│  • Model: OpenAI GPT-4 Omni Mini                               │
│  • Uses Prompt Flow (TTP) for data enrichment                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Prompt Template Provider Flow (Eigen_X_Account_Summary_TTP)   │
│  • Queries related Opportunities (all stages, amounts, dates)  │
│  • Queries related Cases (status, priority, descriptions)      │
│  • Builds comprehensive prompt with:                           │
│    - Detailed system instructions                              │
│    - Account data (name, type, industry, revenue)             │
│    - All Opportunity details                                   │
│    - All Case details                                          │
│    - Output structure requirements                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI Model Processing                                            │
│  • Analyzes all provided data                                  │
│  • Generates structured summary following template rules       │
│  • Returns HTML-formatted response                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Data Storage (Account_Summary__c)                              │
│  • Agentforce_Summary__c: Rich text content                    │
│  • Summary_Date__c: Generation timestamp                       │
│  • Account__c: Master-detail to Account                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  UI Refresh                                                     │
│  • LWC refreshes using @wire refresh                           │
│  • New summary appears at top of accordion                     │
│  • Historical summaries remain accessible                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Component Details

### 1. Custom Object: Account_Summary__c

**Purpose:** Stores AI-generated account summaries with full relationship tracking

**Key Fields:**
- `Account__c` (Master-Detail to Account) - Links summary to parent account
- `Agentforce_Summary__c` (Rich Text Area, 32,768 chars) - HTML-formatted AI-generated content
- `Summary_Date__c` (Date) - When the summary was created
- `Name` (Auto-Number: AS-{0000000}) - Unique identifier

**Security:**
- Sharing: ControlledByParent (inherits Account access)
- CRUD enforced via `WITH SECURITY_ENFORCED` in SOQL queries

**Location:** `force-app/main/default/objects/Account_Summary__c/`

---

### 2. Lightning Web Component: accountSummaryAccordion

**Purpose:** Provides interactive UI for viewing and generating account summaries

**Features:**
- **Empty State:** Prominent call-to-action when no summaries exist
- **Accordion Display:** Shows active summary with full content, collapses other summaries
- **Multi-Summary Management:** Handles historical summaries with date-based labeling
- **Flow Integration:** Embedded hidden Lightning Flow component for background processing
- **Loading States:** Spinner and disabled buttons during generation
- **Error Handling:** Comprehensive console logging for debugging flow issues

**Technical Details:**
- **Wire Service:** `@wire(getAccountSummaries)` - Reactive data loading from Apex
- **Record Context:** `@api recordId` - Automatically receives Account ID from page context
- **Flow Invocation:** `lightning-flow` component with `startFlow()` method
- **Refresh Pattern:** `refreshApex()` after flow completion to show new summary

**Files:**
- `accountSummaryAccordion.js` - Component logic (147 lines)
- `accountSummaryAccordion.html` - Template with conditional rendering (107 lines)
- `accountSummaryAccordion.css` - Styling with SLDS tokens (97 lines)
- `accountSummaryAccordion.js-meta.xml` - Metadata (exposed on Account record pages)

**Location:** `force-app/main/default/lwc/accountSummaryAccordion/`

---

### 3. Apex Controller: AccountSummaryController

**Purpose:** Provides secure data access for Lightning Web Component

**Methods:**
- `getAccountSummaries(Id accountId)` - Returns all summaries for an account, ordered by date (newest first)

**Security Features:**
- `@AuraEnabled(cacheable=true)` - Enables Lightning Data Service caching
- `WITH SECURITY_ENFORCED` - Enforces field and object-level security
- `with sharing` - Respects org sharing rules
- Exception handling with `AuraHandledException`

**Location:** `force-app/main/default/classes/AccountSummaryController.cls`

---

### 4. Orchestration Flow: Run_Eigen_X_Account_Summary

**Purpose:** Coordinates the summary generation process from trigger to storage

**Flow Type:** Auto-Launched Flow (can be invoked from LWC, Agent Actions, Process Builder, etc.)

**Flow Steps:**
1. **Get Account** (Record Lookup)
   - Queries Account record by `accountId` input variable
   - Retrieves all available Account fields for prompt context

2. **Eigen X Account Summary Action** (Prompt Template Action)
   - Action Type: `generatePromptResponse`
   - References: `Eigen_X_Account_Summary` prompt template
   - Input: Full Account sObject
   - Output: `PromptOutput` variable (String) containing generated summary

3. **Attach Account Summary** (Record Create)
   - Creates new `Account_Summary__c` record
   - Fields:
     - `Account__c` ← `accountId` input
     - `Agentforce_Summary__c` ← `PromptOutput` from AI
     - `Summary_Date__c` ← `$Flow.CurrentDate`

**Input Variables:**
- `accountId` (String, Required) - Salesforce Account ID

**Location:** `force-app/main/default/flows/Run_Eigen_X_Account_Summary.flow-meta.xml`

---

### 5. Prompt Template: Eigen_X_Account_Summary

**Purpose:** Defines the AI model invocation and prompt construction

**Template Type:** `einstein_gpt__recordSummary` (Salesforce standard template type for record summarization)

**Configuration:**
- **Primary Model:** `sfdc_ai__DefaultOpenAIGPT4OmniMini` (OpenAI GPT-4 Omni Mini)
- **Language Style:** `einstein_gpt__enUsLanguageStyle` (English US)
- **Related Entity:** Account
- **Visibility:** Global

**Template Versions:**
- **Version 1 (Inactive):** Simple prompt - "Summarize the Account and related child objects"
- **Version 2 (Active):** Advanced prompt using Template Provider Flow

**Active Template Content:**
```
{!$Flow:Eigen_X_Account_Summary_TTP_Flow.Prompt}
```
This references the output of the Prompt Template Provider (TTP) Flow, which dynamically builds the prompt.

**Input Parameters:**
- `objectToSummarize` (Required) - SObject type: Account

**Template Data Providers:**
- **Flow:** `Eigen_X_Account_Summary_TTP_Flow`
- **Parameter Mapping:** `objectToSummarize` → `{!$Input:Account}`

**Location:** `force-app/main/default/genAiPromptTemplates/Eigen_X_Account_Summary.genAiPromptTemplate-meta.xml`

---

### 6. Prompt Template Provider Flow: Eigen_X_Account_Summary_TTP_Flow

**Purpose:** Gathers related data and constructs comprehensive, instruction-rich prompt for AI model

**Flow Type:** Prompt Flow (Template Type Provider) - Special flow type for building prompts

**Capabilities:**
- **Trigger Type:** `Capability` - Invoked by Prompt Template
- **Capability Type:** `PromptTemplateType://einstein_gpt__recordSummary`

**Flow Steps:**

#### Step 1: Get Account
- **Element:** Record Lookup
- **Filter:** `Id = $Input.objectToSummarize.Id`
- **Fields:** All available Account fields (Name, Type, Industry, Sales fields, etc.)
- **Output:** Stores full Account record

#### Step 2: Get Opportunities
- **Element:** Record Lookup (Collection)
- **Filter:** `AccountId = $Input.objectToSummarize.Id`
- **Sort:** CloseDate DESC
- **Fields Queried:**
  - `Name`, `Description`
  - `Amount`, `CloseDate`, `Probability`
  - `StageName`, `ForecastCategory`, `Type`
  - `NextStep`
- **Output:** Collection of all related Opportunities

#### Step 3: Loop Opptys
- **Element:** Loop
- **Collection:** `Get_Opportunities` output
- **Action per iteration:** Add Opty Info (Assignment)

#### Step 4: Add Opty Info
- **Element:** Assignment (AddPromptInstructions subtype)
- **Action:** Appends formatted Opportunity details to `$Output.Prompt`
- **Format:**
  ```
  Opportunity
  Name: {Name}
  Stage: {StageName}
  Close Date: {CloseDate}
  Amount: {Amount}
  Probability: {Probability}
  Next Step: {NextStep}
  Type: {Type}
  ```

#### Step 5: Get Cases
- **Element:** Record Lookup (Collection)
- **Filter:** `AccountId = $Input.objectToSummarize.Id`
- **Sort:** LastModifiedDate DESC
- **Fields Queried:**
  - `CaseNumber`, `Subject`, `Description`
  - `Status`, `Priority`
  - `ClosedDate`, `CreatedDate`, `LastModifiedDate`
  - `SDO_Service_Close_Summary__c` (custom field for case resolution summary)
- **Output:** Collection of all related Cases

#### Step 6: Loop Cases
- **Element:** Loop
- **Collection:** `Get_Cases` output
- **Action per iteration:** Add Case Info (Assignment)

#### Step 7: Add Case Info
- **Element:** Assignment (AddPromptInstructions subtype)
- **Action:** Appends formatted Case details to `$Output.Prompt`
- **Format:**
  ```
  Case: {CaseNumber}
  Subject: {Subject}
  Description: {Description}
  Close Summary: {SDO_Service_Close_Summary__c}
  Status: {Status}
  Priority: {Priority}
  ```

#### Step 8: Add Summary Instructions
- **Element:** Assignment (AddPromptInstructions subtype)
- **Action:** Appends comprehensive AI instructions to `$Output.Prompt`
- **Content:** 135+ lines of detailed instructions including:
  - System role definition
  - Goal and rules
  - Account data context
  - Required output structure (6 sections)
  - Style guidelines
  - Handling of missing data
  - Output format requirements

**Final Prompt Structure:**
```
[All Opportunity details from loop]
[All Case details from loop]
[Comprehensive instructions]
[Account data]
[Output format requirements]
```

**Output:**
- `$Output.Prompt` - Complete prompt string sent to AI model

**Location:** `force-app/main/default/flows/Eigen_X_Account_Summary_TTP_Flow.flow-meta.xml`

---

### 7. AI Instructions & Output Structure

The Prompt Template Provider Flow includes detailed instructions that ensure consistent, high-quality summaries. Here's the summary structure the AI follows:

#### A. Account Overview
2-4 sentences covering:
- Account name and type (prospect/customer/partner)
- Location, industry, size (revenue/employees)
- Notable segment or health information

#### B. Relationship & History
- How long we've been working together
- Whether they're a new lead, active customer, or long-term customer
- Based on earliest Opportunity/Case dates

#### C. Sales Pipeline & Revenue
- Count of open Opportunities
- Total open pipeline amount
- Large or strategically important deals
- Recent wins (closed-won) and losses
- Patterns (many small deals vs. few large, stuck stages)

#### D. Support & Cases
- Number of open Cases and priorities
- High-priority or escalated issues
- Patterns (frequent questions vs. recurring incidents)
- Support load assessment

#### E. Key Risks & Opportunities
2-4 bullet points highlighting:
- **Risks:** Open cases, lost deals, stalled opportunities
- **Opportunities:** Late-stage deals, strong history, expansion potential

#### F. Recommended Next Steps
3-5 concise suggestions for:
- Sales actions (follow-ups, progressing deals)
- Customer success actions (resolving cases)
- Relationship building (check-ins, QBRs, renewals)

**Style Guidelines Enforced by Prompt:**
- Clear, professional, concise business language
- Short paragraphs and bullet points
- No Salesforce jargon or API field names
- No invented data - only use provided input
- Natural labels instead of technical field names

---

## Deployment

### Prerequisites
- Salesforce org with Health Cloud enabled
- Agentforce/Einstein GPT enabled
- API Version 65.0 or higher
- Appropriate user permissions (see Permission Sets below)

### Deployment Commands

```bash
# Deploy all metadata
sf project deploy start

# Deploy specific components
sf project deploy start -m CustomObject:Account_Summary__c
sf project deploy start -m LightningComponentBundle:accountSummaryAccordion
sf project deploy start -m Flow:Run_Eigen_X_Account_Summary
sf project deploy start -m Flow:Eigen_X_Account_Summary_TTP_Flow
sf project deploy start -m GenAiPromptTemplate:Eigen_X_Account_Summary

# Validate deployment (no changes)
sf project deploy start --dry-run

# Deploy with tests
sf project deploy start --test-level RunLocalTests
```

### Post-Deployment Setup

1. **Assign Permission Set:**
   ```bash
   sf org assign permset --name Eigen_X_Admin
   ```

2. **Add Component to Account Record Page:**
   - Navigate to any Account record
   - Click Setup (gear icon) → Edit Page
   - Drag "Account Summary Accordion" component to side panel or main region
   - Save and activate page

3. **Verify Prompt Template:**
   - Setup → Prompt Builder
   - Find "Eigen X Account Summary"
   - Verify active version is Version 2 (with TTP Flow)
   - Test with sample Account

4. **Create Sample Data:** (See Action Item #3 above for details)

---

## Permission Sets

### Eigen_X_Admin
**Purpose:** Grants full access to Account Summary functionality

**Includes:**
- **Object Permissions:**
  - Account_Summary__c: Read, Create, Edit, Delete, View All, Modify All
- **Field Permissions:**
  - All Account_Summary__c fields: Read, Edit
- **Apex Classes:**
  - AccountSummaryController: Enabled
- **Flows:**
  - Run_Eigen_X_Account_Summary: Run
  - Eigen_X_Account_Summary_TTP_Flow: Run
- **Prompt Templates:**
  - Eigen_X_Account_Summary: Access

**Location:** `force-app/main/default/permissionsets/Eigen_X_Admin.permissionset-meta.xml`

---

## Testing

### Manual Testing Checklist

- [ ] **LWC Empty State:** Navigate to Account with no summaries, verify empty state displays
- [ ] **Generate First Summary:** Click "Generate Account Summary", verify spinner appears
- [ ] **Flow Completion:** Wait for flow to complete, verify new summary appears
- [ ] **Summary Content:** Review generated summary, verify all 6 sections present
- [ ] **Generate Second Summary:** Click "Generate Summary" again, verify accordion shows multiple
- [ ] **Switch Summaries:** Click on different summary tabs, verify active summary changes
- [ ] **Related Data:** Verify Opportunities and Cases are included in summary content
- [ ] **Error Handling:** Test with Account that has no Opportunities or Cases
- [ ] **Console Errors:** Check browser console for any JavaScript errors

### Test Commands

```bash
# Run Apex tests
npm test

# Run LWC tests
npm run test:unit

# Run with coverage
npm run test:unit:coverage

# Lint code
npm run lint

# Format code
npm run prettier
```

---

## Known Issues

See **Outstanding Action Items** section above for current known issues and resolution plans.

---

## Customization Guide

### Modifying Summary Instructions

To change how summaries are generated:

1. Open Flow: `Eigen_X_Account_Summary_TTP_Flow`
2. Find Assignment: "Add Summary Instructions"
3. Edit the long string value containing prompt instructions
4. Save and activate flow
5. New summaries will use updated instructions

**Note:** Changes take effect immediately, no need to update the Prompt Template.

### Adding New Data Sources

To include additional related objects (e.g., Contracts, Orders):

1. Open `Eigen_X_Account_Summary_TTP_Flow`
2. Add new Record Lookup element (e.g., "Get Contracts")
3. Add Loop element to iterate over results
4. Add Assignment to append data to `$Output.Prompt`
5. Place new elements in flow before "Add Summary Instructions"
6. Save and activate

### Changing AI Model

To use a different AI model:

1. Setup → Prompt Builder
2. Open "Eigen X Account Summary"
3. Edit active version
4. Change "Primary Model" dropdown
5. Save and publish new version

### Styling the LWC

Modify `accountSummaryAccordion.css` to customize:
- Colors (uses SLDS tokens for theme compatibility)
- Spacing and padding
- Accordion behavior
- Scrollbar appearance

---

## Troubleshooting

### Flow Doesn't Start
- Check browser console for error messages
- Verify `recordId` is available (check console logs)
- Ensure user has "Run Flows" permission
- Verify flow is Active in Setup

### Summary Not Saving
- Check flow error emails sent to admin
- Verify user has Create permission on Account_Summary__c
- Check Account lookup field is populated correctly
- Review Apex logs for exceptions

### AI Returns Generic Summary
- Verify TTP Flow is gathering Opportunities and Cases
- Check that Account has related records to analyze
- Review prompt instructions in "Add Summary Instructions" assignment
- Test Prompt Template directly in Prompt Builder

### Component Not Appearing on Page
- Verify component is added to page layout via Lightning App Builder
- Check user profile has Read access to Account_Summary__c object
- Ensure LWC is deployed successfully
- Clear browser cache and refresh

---

## Resources

### Salesforce Documentation
- [Agentforce Overview](https://help.salesforce.com/s/articleView?id=sf.einstein_ai_overview.htm)
- [Prompt Builder Guide](https://help.salesforce.com/s/articleView?id=sf.prompt_builder_overview.htm)
- [Template-Triggered Prompt Flows](https://help.salesforce.com/s/articleView?id=sf.flow_build_prompt_flow.htm)
- [Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc)
- [Health Cloud Documentation](https://developer.salesforce.com/docs/atlas.en-us.health_cloud.meta/health_cloud/)

### Project Files
- Project Configuration: `sfdx-project.json`
- Development Guide: `CLAUDE.md`
- Git Repository: https://github.com/j-roche-dev/healthCloudAgentDemo.git

---

## Support & Contributing

**Issues:** Report bugs or request features via GitHub Issues
**Branch:** `novemberBuild` (current development branch)
**Contact:** jroche@eigenx.com.hlsagent (demo org)

---

**Last Updated:** 2025-11-17
**Version:** 1.0.0
**Salesforce API Version:** 65.0
