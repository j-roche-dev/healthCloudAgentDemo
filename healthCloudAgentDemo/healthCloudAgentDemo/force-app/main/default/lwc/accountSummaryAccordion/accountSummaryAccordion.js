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
    showFlowComponent = false;
    flowStartPending = false;
    flowTimeoutId = null;
    wiredSummariesResult;

    flowApiName = 'Run_Eigen_X_Account_Summary';

    connectedCallback() {
        console.log('Component connected. recordId:', this.recordId);
    }

    renderedCallback() {
        console.log('Component rendered. recordId:', this.recordId);

        // If we're waiting to start the flow, do it now that the component is rendered
        if (this.flowStartPending) {
            this.flowStartPending = false;
            const flowComponent = this.template.querySelector('lightning-flow');
            if (flowComponent) {
                console.log('Flow component found after render, starting flow:', this.flowApiName);
                flowComponent.startFlow(this.flowApiName, this.flowInputVariables);
            } else {
                console.error('Flow component still not found after render');
                this.isFlowRunning = false;
                this.showFlowComponent = false;
            }
        }

        // Update the manual DOM for formatted summary
        this.updateFormattedSummary();
    }

    updateFormattedSummary() {
        const summaryDiv = this.template.querySelector('.formatted-summary');
        if (summaryDiv && this.activeSummary && this.activeSummary.formattedSummary) {
            summaryDiv.innerHTML = this.activeSummary.formattedSummary;
        }
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
                    label: this.formatSummaryLabel(summary),
                    formattedSummary: this.convertMarkdownToHtml(summary.Agentforce_Summary__c)
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
            // Parse date as local date to avoid timezone offset issues
            const parts = summary.Summary_Date__c.split('-');
            const date = new Date(parts[0], parts[1] - 1, parts[2]);
            return `Summary - ${date.toLocaleDateString()}`;
        }
        return summary.Name || 'Account Summary';
    }

    convertMarkdownToHtml(markdownText) {
        if (!markdownText) return '';
        
        console.log('Original markdown:', markdownText);
        
        let html = markdownText;
        
        // Convert **bold** to <strong>bold</strong>
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert line breaks to <br> tags but preserve paragraph structure  
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');
        
        // Wrap in paragraph tags
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p><br><\/p>/g, '');
        
        // Handle bullet points - convert lines starting with - to <li>
        html = html.replace(/<p>- (.*?)<\/p>/g, '<li>$1</li>');
        html = html.replace(/<br>- (.*?)<br>/g, '</li><li>$1');
        
        // Wrap consecutive <li> elements in <ul>
        html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
        
        // Clean up nested lists and extra breaks
        html = html.replace(/<\/ul><ul>/g, '');
        html = html.replace(/<br><ul>/g, '<ul>');
        html = html.replace(/<\/ul><br>/g, '</ul>');
        
        // Handle HTML entities that might be present
        html = html.replace(/&amp;/g, '&');
        html = html.replace(/&#39;/g, "'");
        
        console.log('Converted HTML:', html);
        
        return html;
    }

    handleSectionClick(event) {
        const clickedId = event.currentTarget.dataset.id;

        // Update active state for all summaries
        this.accountSummaries = this.accountSummaries.map(summary => ({
            ...summary,
            isActive: summary.Id === clickedId,
            formattedSummary: summary.formattedSummary || this.convertMarkdownToHtml(summary.Agentforce_Summary__c)
        }));

        this.activeSection = clickedId;
        
        // Update the formatted summary display
        setTimeout(() => {
            this.updateFormattedSummary();
        }, 0);
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
        this.showFlowComponent = true;
        this.flowStartPending = true;

        // Set a fallback timeout to stop spinner if flow doesn't complete
        // Clear any existing timeout first
        if (this.flowTimeoutId) {
            clearTimeout(this.flowTimeoutId);
        }

        // 2 minute timeout as fallback
        this.flowTimeoutId = setTimeout(() => {
            console.warn('Flow timeout reached - stopping spinner and refreshing data');
            this.isFlowRunning = false;
            this.showFlowComponent = false;
            this.flowTimeoutId = null;
            // Refresh the data in case flow completed but event didn't fire
            refreshApex(this.wiredSummariesResult);
        }, 120000);

        // Flow will be started in renderedCallback once the component is rendered
        console.log('Flow component will be rendered and started');
    }

    handleFlowStatusChange(event) {
        console.log('Flow status changed:', event.detail.status);
        console.log('Full event detail:', JSON.stringify(event.detail, null, 2));

        // Clear the fallback timeout since we got an event
        if (this.flowTimeoutId) {
            clearTimeout(this.flowTimeoutId);
            this.flowTimeoutId = null;
        }

        // Handle both FINISHED and FINISHED_SCREEN statuses
        if (event.detail.status === 'FINISHED' || event.detail.status === 'FINISHED_SCREEN') {
            this.isFlowRunning = false;
            this.showFlowComponent = false;
            console.log('Flow finished successfully with status:', event.detail.status);
            // Refresh the summaries after flow completes
            refreshApex(this.wiredSummariesResult);
        } else if (event.detail.status === 'ERROR') {
            this.isFlowRunning = false;
            this.showFlowComponent = false;
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

    disconnectedCallback() {
        // Clean up timeout if component is destroyed
        if (this.flowTimeoutId) {
            clearTimeout(this.flowTimeoutId);
        }
    }
}