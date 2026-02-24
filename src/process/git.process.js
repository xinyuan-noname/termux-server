const { exec } = require('child_process');
const logger = require('../logger');
function startGit() {
    let errorSignal = false;
    exec('git add url.txt', (error, stdout, stderr) => {
        if (error) {
            logger.error("提交url失效", error);
            errorSignal = true;
        }
        if(stdout){
            logger.info(stdout);
        }
        if(stderr){
            logger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
    exec('git commit -m "change url"', (error, stdout, stderr) => {
        if (error) {
            logger.error("提交url失效", error);
            errorSignal = true;
        }
        if(stdout){
            logger.info(stdout);
        }
        if(stderr){
            logger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
    exec('git push -u origin main', (error, stdout, stderr) => {
        if (error) {
            logger.error("提交url失效", error);
            errorSignal = true;
        }
        if(stdout){
            logger.info(stdout);
        }
        if(stderr){
            logger.info(stderr);
        }
    })
    if(errorSignal){
        startGit()
        return;
    }
}
module.exports = startGit;