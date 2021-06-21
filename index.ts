import * as tl from 'azure-pipelines-task-lib';
import * as azdev from 'azure-devops-node-api';
import Handlebars from 'handlebars';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import fs from 'fs';

class ReleaseNotesContext {
    workItems: WorkItem[];

    constructor(workItems: WorkItem[]) {
        this.workItems = workItems;
    }
}


function extractOrganization(organizationUrl: string): string {
    // Ref: https://github.com/tinglesoftware/dependabot-azure-devops/blob/main/src/extension/task/index.ts

    let parts = organizationUrl.split("/");

    if (parts.length === 6) {
        return parts[4];
    }

    // Check for on-premise style: https://server.domain.com/tfs/x/
    if (parts.length === 6) {
        return parts[4];
    }

    // Check for new style: https://dev.azure.com/x/
    if (parts.length === 5) {
        return parts[3];
    }

    // Check for old style: https://x.visualstudio.com/
    if (parts.length === 4) {
        // Get x.visualstudio.com part.
        let part = parts[2];

        // Return organization part (x).
        return part.split(".")[0];
    }

    tl.setResult(
        tl.TaskResult.Failed,
        `Error parsing organization from organization url: '${organizationUrl}'.`
    );
    
    // Shouldn't run?
    return "";
}


async function run() {
    try {
        let organizationUrl = tl.getVariable("System.TeamFoundationCollectionUri")!;
        tl.debug(`CollectionUri: ${organizationUrl}`);

        let systemAccessToken = tl.getInput("azureDevOpsAccessToken");
        if (!systemAccessToken) {
            tl.debug("No custom token provided. The SystemVssConnection's AccessToken will be used instead.");
            systemAccessToken = tl.getEndpointAuthorizationParameter(
                "SystemVssConnection", 
                "AccessToken", 
                false)!;
        }

        // Make this an optional input
        let repository = tl.getVariable("Build.Repository.Name")!;

        repository = encodeURI(repository);

        let queryId = tl.getInput('queryId', true)!;
        let templateLocation = tl.getInput('template', true)!;

        if (!tl.exist(templateLocation)) {
            throw new Error('Could not find the template');
        }

        // Create connection
        let authHandler = azdev.getPersonalAccessTokenHandler(systemAccessToken);
        let connection = new azdev.WebApi(organizationUrl, authHandler);

        let workItemApi = await connection.getWorkItemTrackingApi();

        let queryResult = await workItemApi.queryById(queryId);

        if (!queryResult || !queryResult.workItems) {
            // TODO: Better error
            throw new Error('Response from query is undefined.');
        }
        
        let workItems: WorkItem[] = [];
        for (let i = 0; i < queryResult.workItems.length; i++) {
            workItems.push(await workItemApi.getWorkItem(queryResult.workItems[i].id!, undefined, undefined, undefined, ''));
        }

        var context = new ReleaseNotesContext(workItems);
        
        // TODO: Use context in handlebars stuff
        Handlebars.compile(fs.readFileSync(templateLocation));

        console.log(workItems);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}


run();