import path from 'path';
import assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('CreateReleaseNotes', function () {
    before(function () {

    });

    after(() => {

    });

    it('should succeed with basic inputs', function (done: Mocha.Done) {
        // Add success tests
        this.timeout(10000);
        let tp = path.join(__dirname, 'success.js');
        let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
        tr.run();

        console.log(tr.succeeded);
        console.log(tr.stdout);
        console.log(tr.stderr);
        
        assert(tr.succeeded, 'Task should have succeeded');
        assert(tr.stderr.length == 0 || tr.errorIssues.length, 'should not have written to stderr');

        // Add more asserts
        done();
    });

    // it('should fail', function (done: Mocha.Done) {
    //     // Add failure tests
    // });
})
