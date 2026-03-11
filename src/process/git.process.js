const { exec } = require('child_process');
const gitLogger = require('../logger/git');
async function startGit() {
    try {
        await new Promise((reslove, reject) => {
            exec('git add url.txt', (error, stdout, stderr) => {
                if (error) {
                    gitLogger.error(error);
                    reject(error);
                }
                if (stdout) {
                    gitLogger.info(stdout);
                    reslove();
                }
                if (stderr) {
                    gitLogger.info(stderr);
                }
            }).on("close", reslove)
        })
        await new Promise((reslove, reject) => {
            exec('git commit -m "change url"', (error, stdout, stderr) => {
                if (error) {
                    gitLogger.error(error);
                    reject(error)
                }
                if (stdout) {
                    gitLogger.info(stdout);
                    reslove()
                }
                if (stderr) {
                    gitLogger.info(stderr);
                }
            }).on("close", reslove)
        })
        await new Promise((reslove, reject) => {
            exec(`git push -u origin ${process.env.GIT_BRACH}`, (error, stdout, stderr) => {
                if (error) {
                    gitLogger.error(error);
                    reject(error)
                }
                if (stdout) {
                    gitLogger.info(stdout);
                    reslove()
                }
                if (stderr) {
                    gitLogger.info(stderr);
                }
            }).on("close", reslove)
        })
        return true;
    } catch {
        return false;
    }

}
module.exports = startGit;