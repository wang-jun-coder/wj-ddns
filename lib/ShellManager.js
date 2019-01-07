const os = require('os');
const exec = require('child_process').exec;
class ShellManager {

    static async execCmd(cmd) {
        return new Promise((resolve,reject) => {
            exec(cmd, function (error, stdout, stderr) {
                if (error || stderr) return reject(error || stderr);
                return resolve(stdout);
            })
        });
    }

    static async listWJDDNSProcess() {
        const cmd = os.platform() === 'win32' ? '' : 'ps -ef | grep wj-ddns';
        const stdout = await this.execCmd(cmd);
        // 对结果字符串进行处理
        const pros = stdout.split('\n');
        const prosStdout = pros.filter(function (item) {
            return item.indexOf('bin/wj-ddns.js ') !== -1;
        });
        const results = [];

        prosStdout.forEach((pro) => {
            const info = pro.split('         ');
            const proInfo = info[0];
            const cmdInfo = info[1];

            const pid = proInfo.split(' ')[3];
            const cmd = cmdInfo.split(' ').slice(1).join(' ');

            results.push({
                pid,
                cmd
            });
        });
        return results;
    }
}

module.exports = ShellManager;
