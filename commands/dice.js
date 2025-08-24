const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('ダイスを振ります！')
        .addIntegerOption(option =>
            option.setName('dice')
                .setDescription('ダイスの数')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('side')
                .setDescription('ダイスの面の数')
                .setRequired(true)
        ),
    async execute(interaction) {
        const dice = interaction.options.getInteger('dice');
        const side = interaction.options.getInteger('side');
        if (dice < 1 || dice > 2**26) await interaction.reply('ダイスの数が無効です。ダイスの数は2^26以下の正整数で指定してください。');
        else if (side < 1 || side > 2**26) await interaction.reply('面の数が無効です。面の数は2^26以下の正整数で指定してください。');
        
        await interaction.deferReply();
        try {
            let result = 0;
            let c = 0;
            let f = 0;
            let message = `詳細：`;
            let flag_de = true;
            let flag_cf = false;
            if (dice > 100) {
                flag_de = false;
                message += `ダイスの数が多いため省略`;
            }
            if (side === 100) flag_cf = true;

            for (let i = 0; i < dice; ++i) {
                if (flag_de && i > 0) message += ', ';
                const num = Math.ceil(Math.random() * side);
                result += num;
                if (flag_de) message += num;
                if (flag_cf) {
                    if (flag_de) {
                        if (num <= 5) message += '！クリティカル！';
                        if (num >= 96) message += '！ファンブル！';
                    }
                    if (num <= 5) c++;
                    if (num >= 96) f++;
                }
            }

            if (flag_cf) {
                if (c !== 0 || f !== 0) message += ' \n(';
                if (c !== 0) message += `クリティカル:${c}回`;
                if (c !== 0 && f !== 0) message += ', ';
                if (f !== 0) message += `ファンブル:${f}回`;
                if (c !== 0 || f !== 0) message += ')';
            }
            await interaction.followUp(`${dice}d${side}を振りました！ \n結果：${result} \n${message}`);

        } catch (err) {

        }
    }
};