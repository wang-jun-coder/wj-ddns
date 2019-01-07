const fs = require('fs');
const path = require('path');
const DDNSTask = require('./DDNSAliTask');
const shellManager = require('./ShellManager');

class DDNSManager {

    constructor(){
        /*
        * 任务集合
        * */
        this._tasks = [];
    }

    /**
     * 添加一个 ddns 任务
     *
     * @param {Object} options
     * @param {Number} options.kind         任务类型, 1 标记阿里云服务, 暂时只支持阿里云服务
     * @param {String} options.domain       要动态设置的域名对应的主域名
     * @param {String} options.RR           要动态设置的域名
     * @param {String} options.key          对应平台的 key, 暂时指阿里云的 key (注意: 此 key 需有该域名权限)
     * @param {String} options.secret       对应平台 key 的 secret, 暂时指阿里云的 secret
     * @param {Number} options.ttl          定时检测本地 ip 与域名是否符合的时间间隔, 单位: 分钟
     * @return {Promise<void>}
     */
    async addTask(options) {
        const {kind,domain, RR, key,secret,ttl} = options;

        if (kind !== 1) {
            throw new Error('暂不支持其他平台');
        }

        const opt = {
            domain,
            RR,
            ttl,
            accessKeyId: key,
            accessKeySecret: secret,
            apiVersion: '2015-01-09',
            endpoint: 'https://alidns.aliyuncs.com'
        };

        let task = new DDNSTask(opt);
        this._tasks.push(task);
    };

    /**
     * 停止 ddns 服务
     *
     * @param {Object} options 停止任务参数
     * @param {String} [options.domain]    要停止的域名, 不传则不限制
     * @param {String} [options.RR]        要停止的子域名 RR 不传则不限制
     * @param {Boolean} options.all        是否停止所有
     * @return {Promise<void>}
     */
    async stopTasks(options) {
        const { domain, RR,  all } = options;
        const currPid = process.pid;
        const tasks = await shellManager.listWJDDNSProcess();

        tasks.forEach(function (task) {
            const { pid, cmd } = task;
            if (currPid === pid) return;

            // domain 限制
            if (domain && domain.length>0) {
                if (cmd.indexOf(domain) === -1) return;
                shellManager.killProcessWithPid(pid);
                return;
            }
            // rr 限制
            if (RR && RR.length>0) {
                if (cmd.indexOf(RR) === -1) return;
                shellManager.killProcessWithPid(pid);
                return;
            }

            // 要是没有 domain 或 RR 限制, 但指定了 all, 则全都删除
            if (all && !(domain || RR)) {
                shellManager.killProcessWithPid(pid);
            }
        });
    }

    async listTasks() {
        const currPid = process.pid;
        const tasks = await shellManager.listWJDDNSProcess();

        tasks.filter(t => {
            return t.pid !== currPid;
        }).map(t => {
            console.log(t.raw);
        })
    }


    // 获取 wj-ddns
    async getVersion() {
        const packageJsonPath = path.resolve(__dirname, '../package.json');
        const packageJsonStr = fs.readFileSync(packageJsonPath);
        const pack = JSON.parse(packageJsonStr);
        return pack.version;
    }

}

module.exports = DDNSManager;
