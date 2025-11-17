public with sharing class AccountSummaryController {

    @AuraEnabled(cacheable=true)
    public static List<Account_Summary__c> getAccountSummaries(Id accountId) {
        try {
            return [
                SELECT Id, Name, Summary_Date__c, Agentforce_Summary__c, CreatedDate
                FROM Account_Summary__c
                WHERE Account__c = :accountId
                WITH SECURITY_ENFORCED
                ORDER BY Summary_Date__c DESC NULLS LAST, CreatedDate DESC
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching Account Summaries: ' + e.getMessage());
        }
    }
}
