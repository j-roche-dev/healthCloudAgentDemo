import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAccountSummaries from '@salesforce/apex/AccountSummaryController.getAccountSummaries';

export default class AccountSummaryAccordion extends LightningElement {
    _recordId;

    @api
    get recordId() {
        return this._recordId;
    }

    set recordId(value) {
        this._recordId = value;
        console.log('recordId setter called with value:', value);
    }

    accountSummaries = [];
    activeSection = '';
    error;
    isLoading = true;
    isFlowRunning = false;
    wiredSummariesResult;

    flowApiName = 'Run_Eigen_X_Account_Summary';

    connectedCallback() {
        console.log('Component connected. recordId:', this.recordId);
    }

    renderedCallback() {
        console.log('Component rendered. recordId:', this.recordId);
    }

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
        console.log('Generate Summary clicked');
        console.log('recordId:', this.recordId);
        console.log('flowInputVariables:', JSON.stringify(this.flowInputVariables));

        if (!this.recordId) {
            console.error('recordId is not available');
            return;
        }

        this.isFlowRunning = true;
        const flowComponent = this.template.querySelector('lightning-flow');
        if (flowComponent) {
            console.log('Starting flow:', this.flowApiName);
            flowComponent.startFlow(this.flowApiName, this.flowInputVariables);
        } else {
            console.error('Flow component not found');
            this.isFlowRunning = false;
        }
    }

    handleFlowStatusChange(event) {
        console.log('Flow status changed:', event.detail.status);
        console.log('Full event detail:', JSON.stringify(event.detail, null, 2));

        if (event.detail.status === 'FINISHED') {
            this.isFlowRunning = false;
            console.log('Flow finished successfully');
            // Refresh the summaries after flow completes
            refreshApex(this.wiredSummariesResult);
        } else if (event.detail.status === 'ERROR') {
            this.isFlowRunning = false;
            console.error('Flow error status:', event.detail.status);
            console.error('Flow error detail:', event.detail);
            console.error('Flow error outputVariables:', event.detail.outputVariables);
            console.error('Flow error message:', event.detail.message);

            // Try to extract more error info
            if (event.detail.outputVariables) {
                event.detail.outputVariables.forEach(variable => {
                    console.error(`Variable ${variable.name}:`, variable.value);
                });
            }
        }
    }
}