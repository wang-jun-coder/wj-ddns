#!/usr/bin/env node
const DDNSManager = require('../lib/DDNSManager');
const manager = new DDNSManager();

const run = async () => {

    const program = require('commander');
    program
        .version('1.0.0','-v,--version');

    // 启动 ddns
    program
        .command('setup <domain> <RR>')
        .usage('wj-ddns setup wangjuncoder.cn test -k xxx -s xxx -ttl 10')
        .option('-k, --key [key]', 'aliyun access key(has domain access)')
        .option('-s, --secret [secret]', 'aliyun access key secret')
        .option('-t, --ttl [ttl]', 'check frequency, unit is minute')
        .action(function (domain, RR, option) {
            console.log(domain);
            console.log(option.key);
            console.log(option.secret);
            console.log(option.ttl);
            const {key, secret, ttl} = option;

            console.log(manager.listTask());



            manager.addTask({
                kind:1,
                domain,
                RR,
                key,
                secret,
                ttl,

            });

            // manager.listTask().then(result => {
            //     console.log(result);
            // }).catch(error => {
            //     console.log(error);
            // });

        });


    // 取消 ddns


    program.parse(process.argv);
};
run();
