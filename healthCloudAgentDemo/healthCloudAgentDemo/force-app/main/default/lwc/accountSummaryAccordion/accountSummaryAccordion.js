import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAccountSummaries from '@salesforce/apex/AccountSummaryController.getAccountSummaries';

export default class AccountSummaryAccordion extends LightningElement {
    @api recordId; // Account Id from the record page

    accountSummaries = [];
    activeSection = '';
    error;
    isLoading = true;
    isFlowRunning = false;
    wiredSummariesResult;

    flowApiName = 'Run_Eigen_X_Account_Summary';

    @wire(getAccountSummaries, { accountId: '$recordId' })
    wiredSummaries(result) {
        this.wiredSummariesResult = result;
        const { error, data } = result;
        this.isLoading = false;
        if (data) {
            this.accountSummaries = data.map((summary, index) => {
                return {
                    ...summary,
                    isActive: index === 0, // First item active by default
                    label: this.formatSummaryLabel(summary)
                };
            });
            if (this.accountSummaries.length > 0) {
                this.activeSection = this.accountSummaries[0].Id;
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accountSummaries = [];
            console.error('Error loading Account Summaries:', error);
        }
    }

    formatSummaryLabel(summary) {
        if (summary.Summary_Date__c) {
            const date = new Date(summary.Summary_Date__c);
            return `Summary - ${date.toLocaleDateString()}`;
        }
        return summary.Name || 'Account Summary';
    }

    handleSectionClick(event) {
        const clickedId = event.currentTarget.dataset.id;

        // Update active state for all summaries
        this.accountSummaries = this.accountSummaries.map(summary => ({
            ...summary,
            isActive: summary.Id === clickedId
        }));

        this.activeSection = clickedId;
    }

    get hasMultipleSummaries() {
        return this.accountSummaries.length > 1;
    }

    get hasSummaries() {
        return this.accountSummaries.length > 0;
    }

    get activeSummary() {
        return this.accountSummaries.find(s => s.isActive);
    }

    get flowInputVariables() {
        return [
            {
                name: 'accountId',
                type: 'String',
                value: this.recordId
            }
        ];
    }

    handleGenerateSummary() {
        this.isFlowRunning = true;
        const flowComponent = this.template.querySelector('lightning-flow');
        if (flowComponent) {
            flowComponent.startFlow(this.flowApiName, this.flowInputVariables);
        }
    }

    handleFlowStatusChange(event) {
        if (event.detail.status === 'FINISHED') {
            this.isFlowRunning = false;
            // Refresh the summaries after flow completes
            refreshApex(this.wiredSummariesResult);
        } else if (event.detail.status === 'ERROR') {
            this.isFlowRunning = false;
            console.error('Flow error:', event.detail);
        }
    }
}
