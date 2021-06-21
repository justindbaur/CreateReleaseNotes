import * as mr from 'azure-pipelines-task-lib/mock-run';
import path from 'path';

let taskPath = path.join(__dirname, '..', 'index.js');
let tmr: mr.TaskMockRunner = new mr.TaskMockRunner(taskPath);

// Set system variables
process.env['SYSTEM_TEAMFOUNDATIONCOLLECTIONURI'] = process.env['TEST_COLLECTIONURI'];
process.env['SYSTEM_TEAMPROJECT'] = process.env['TEST_TEAMPROJECT'];

// Set other inputs
tmr.setInput('azureDevOpsAccessToken', process.env['TEST_ACCESSTOKEN']!);
tmr.setInput('queryId', process.env['TEST_QUERYID']!);

tmr.run();