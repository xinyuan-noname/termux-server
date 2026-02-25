const { spawn } = require('child_process');

function startChecker(url) {
    return new Promise(resolve => {
        const curl = spawn('curl', [
            '-s',
            '-o', '/dev/null',
            '-w', '%{http_code}',
            '-m', '5',
            url
        ]);
        let code = '';
        curl.stdout.on('data', d => code += d);
        curl.on('close', () => resolve(code.trim() === '200'));
    });
}

module.exports = {
    startChecker
}