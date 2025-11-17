# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Salesforce Health Cloud project for demonstrating Agentforce capabilities. The project uses Salesforce DX and is configured to work with Health Cloud-enabled orgs.

**Key Details:**
- API Version: 65.0
- Package Directory: `force-app` (default)
- Default Org: jroche@eigenx.com.hlsagent (Health Cloud enabled)
- Target Environment: Health Cloud managed package (HealthCloudGA namespace)

## Custom Objects

### Account_Summary__c
Custom object for storing AI-generated account summaries created by Agentforce.

**Structure:**
- Master-Detail relationship to Account (field: `Account__c`)
- `Summary_Date__c` - Date field for when the summary was created
- `Agentforce_Summary__c` - Rich Text Area (HTML, 32,768 chars) for AI-generated content
- Auto-number name field: AS-{0000000}
- Sharing: ControlledByParent (inherits from Account)

## Essential Commands

### Deployment
```bash
# Deploy all metadata
sf project deploy start

# Deploy specific metadata (e.g., Account Summary object)
sf project deploy start -d force-app/main/default/objects/Account_Summary__c

# Deploy and run tests
sf project deploy start --test-level RunLocalTests
```

### Retrieval
```bash
# Retrieve all metadata
sf project retrieve start

# Retrieve specific metadata type
sf project retrieve start -m CustomObject:Account_Summary__c

# Note: Managed package components (like HealthCloudAdmin permission set)
# cannot be retrieved - they're in the HealthCloudGA namespace
```

### Testing & Linting
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:unit:watch

# Run tests with coverage
npm run test:unit:coverage

# Lint JavaScript (Aura/LWC)
npm run lint

# Format all files
npm run prettier

# Verify formatting without changes
npm run prettier:verify
```

### Data Queries
```bash
# Query Salesforce data
sf data query -q "SELECT Id, Name FROM Account_Summary__c" -o jroche@eigenx.com.hlsagent

# Export query results
sf data query -q "SOQL_QUERY" --json > output.json
```

## Health Cloud Specifics

### Managed Permission Sets
Health Cloud permission sets are in the `HealthCloudGA` managed namespace and cannot be retrieved or modified via metadata API. Key permission sets:
- `HealthCloudAdmin` - Full Health Cloud admin access
- `HealthCloudStandard` - Standard Health Cloud user access
- `HealthCloudFoundation` - Foundation-level access

To view managed permission set details:
```bash
sf data query -q "SELECT Id, Name, Label, NamespacePrefix FROM PermissionSet WHERE NamespacePrefix = 'HealthCloudGA'"
```

### Custom Permission Sets
When adding permissions for custom objects like Account_Summary__c, create custom permission sets rather than attempting to modify managed ones.

## Project Structure

```
force-app/main/default/
├── applications/      # Custom apps
├── aura/             # Aura components
├── classes/          # Apex classes
├── flexipages/       # Lightning pages
├── layouts/          # Page layouts
├── lwc/              # Lightning Web Components
├── objects/          # Custom objects and fields
├── permissionsets/   # Custom permission sets
├── staticresources/  # Static resources
├── tabs/             # Custom tabs
└── triggers/         # Apex triggers
```

## Git Workflow

The project is connected to: https://github.com/j-roche-dev/healthCloudAgentDemo.git

**Current Branch:** novemberBuild

**Commit Message Format:**
When committing, include the AI attribution footer:
```
[Descriptive commit message]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Pre-commit Hooks

Husky is configured with lint-staged to:
1. Run Prettier on all relevant files before commit
2. Lint JavaScript in Aura/LWC components
3. Run related Jest tests for LWC changes

## Development Notes

- The org has Health Cloud managed package installed with various Health Cloud objects available
- When creating new fields or objects that integrate with Health Cloud, verify namespace prefixes
- Use `sf data query` commands to inspect managed package metadata that cannot be retrieved
- For Agentforce integrations, ensure proper field types (Rich Text for AI-generated content)
