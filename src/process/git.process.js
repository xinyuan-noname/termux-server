const { exec } = require('child_process');
const gitLogger = require('../logger/git');
function startGit() {
    let errorSignal = false;
    exec('git add url.txt', (error, stdout, stderr) => {
        if (error) {
            gitLogger.error("提交url失效, 操作: add");
            errorSignal = true;
        }
        if(stdout){
            gitLogger.info(stdout);
        }
        if(stderr){
            gitLogger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
    exec('git commit -m "change url"', (error, stdout, stderr) => {
        if (error) {
            gitLogger.error("提交url失效, 操作: commit");
            errorSignal = true;
        }
        if(stdout){
            gitLogger.info(stdout);
        }
        if(stderr){
            gitLogger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
    exec('git push -u origin main', (error, stdout, stderr) => {
        if (error) {
            gitLogger.error("提交url失效, 操作: push");
            errorSignal = true;
        }
        if(stdout){
            gitLogger.info(stdout);
        }
        if(stderr){
            gitLogger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
}
module.exports = startGit;