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

    async removeTask(options) {

    }

    async listTask(options) {
        const id = process.pid;
        this._tasks = await shellManager.listWJDDNSProcess();
        return this._tasks;
    };



}

module.exports = DDNSManager;
