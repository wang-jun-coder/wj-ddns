let RPCClient = require('@alicloud/pop-core').RPCClient; // 阿里云 client
const publicIp = require('public-ip');
const dns = require('dns');

class DDNSAliTask {

    /**
     * 初始化
     *
     * @param {Object} options
     * @param {String} options.domain           要设置的域名对应的主域名 如: wangjuncoder.cn
     * @param {String} options.RR               要设置的子域名, 如: test
     * @param {Number} options.ttl              域名检测的时间间隔, 单位: 分钟
     * @param {String} options.accessKeyId      阿里云 key
     * @param {String} options.accessKeySecret  阿里云 secret
     * @param {String} options.endpoint         域名解析 api 请求域名
     * @param {String} options.apiVersion       域名解析 版本
     */
    constructor(options){
        const { domain, RR, ttl, accessKeyId, accessKeySecret, endpoint, apiVersion} = options;
        this._aliClient = new RPCClient({
            accessKeyId,
            accessKeySecret,
            endpoint,
            apiVersion
        });
        this._domain = domain;
        this._RR = RR;
        this._ttl = ttl;
        this._timer = null; // 定时器
        this._clientIp = null;

        this.startTask();
    }

    /**
     * 开始任务, 启动定时器
     */
    startTask() {
        this.checkDomainAndSet();
        this._timer = setInterval(()=>{
            this.checkDomainAndSet();
        }, this._ttl*60*1000);
    }

    stopTask() {
        clearInterval(this._timer);
        this._timer = null;
    }

    /**
     * 自动检测 domain 的配置, 与当前是否一致
     * @return {Promise<void>}
     */
    async checkDomainAndSet() {
        // 刷新本机 ip
        await this.refreshClientIp();

        // ip 与 dns ip 一致,不需要处理
        const dnsIp = await this.checkSettingDomainIp();
        if (dnsIp === this._clientIp) return;

        // 重置阿里云配置
        await this.resetAliDnsSetting();

    }

    /**
     * 刷新本机的外网 ip
     * @return {Promise<void>}
     */
    async refreshClientIp() {
        this._clientIp = await publicIp.v4();
    }

    /*
    * 获取要设置的域名当前的解析地址
    * */
    async checkSettingDomainIp() {
        return new Promise((resolve, reject) => {
            const opt = {
                family: 4
            };
            dns.lookup(`${this._RR}.${this._domain}`, opt, function (error, address, family) {
                if (error) {
                    // 没有找到配置, 认为没有 ip
                    if (error.code === 'ENOTFOUND') return resolve();
                    return reject(error);
                }
                return resolve(address);
            });
        });
    }

    /**
     * 重置阿里云 dns 解析的 ip 到当前 ip
     * @return {Promise<*>}
     */
    async resetAliDnsSetting() {
        // 查询该域名下的子域名设置
        const params = {
            DomainName: this._domain,
            RRKeyWord: this._RR,
            TypeKeyWord: 'A',
            PageNumber: 1,
            PageSize: 500
        };
        const requestOption = {
            method: 'POST'
        };
        const result = await this._aliClient.request('DescribeDomainRecords', params, requestOption);
        const record = result.DomainRecords.Record;

        // 没有记录, 新增解析记录
        if (!record || record.length <= 0) {
            await this.addAliDomainRecord();
        } else {
            const recordId = record[0].RecordId;
            await this.updateAliDomainRecord(recordId);
        }
    }

    // 将配置添加至阿里云解析记录中去(没有解析记录时)
    async addAliDomainRecord() {
        const params = {
            DomainName: this._domain,
            RR: this._RR,
            Type: "A",
            Value: this._clientIp,
        };

        const requestOption = {
            method: 'POST'
        };

        const result = await this._aliClient.request('AddDomainRecord', params, requestOption);
        console.log(result);

    }

    // 修改阿里云解析记录(有解析记录时)
    async updateAliDomainRecord(recordId) {
        const params = {
            RecordId: recordId,
            DomainName: this._domain,
            RR: this._RR,
            Type: "A",
            Value: this._clientIp,
        };
        const requestOption = {
            method: 'POST'
        };
        const result = await this._aliClient.request('UpdateDomainRecord', params, requestOption);
        console.log(result);
    }

}

module.exports = DDNSAliTask;
