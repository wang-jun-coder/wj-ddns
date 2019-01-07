#!/usr/bin/env node
const DDNSManager = require('../lib/DDNSManager');
const manager = new DDNSManager();
const program = require('commander');

const run = async () => {

    const ver = await manager.getVersion();
    program
        .version(ver,'-v,--version');

    // 启动 ddns
    program
        .command('setup <domain> <RR>')
        .usage('wj-ddns setup wangjuncoder.cn test -k xxx -s xxx -t 10')
        .option('-k, --key [key]', 'aliyun access key(has domain access)')
        .option('-s, --secret [secret]', 'aliyun access key secret')
        .option('-t, --ttl [ttl]', 'check frequency, unit is minute')
        .action(function (domain, RR, option) {
            const {key, secret, ttl} = option;
            manager.addTask({
                kind:1,
                domain,
                RR,
                key,
                secret,
                ttl,

            });
        });


    // 取消 ddns
    program
        .command('stop [domain] [RR]')
        .usage('wj-ddns stop wangjuncoder.cn test')
        .option('-a, --all', 'stop all tasks')
        .action(function (domain, RR, option) {
            console.log('wj-ddns stop ' + domain + ' ' + RR + ' ' + option.all);
            manager.stopTasks({
                domain,
                RR,
                all: option.all
            })
        });

    program
        .command('list')
        .action(function (option) {
            manager.listTasks()
        });

    program.parse(process.argv);
};
run();
