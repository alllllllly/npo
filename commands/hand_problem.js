const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function pickRandomProblem(low, high) {
    const candidates = problemList.filter(
        p => p[2] >= low && p[2] <= high
    );
    if (candidates.length === 0) return null;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return choice;
}

/*-------------------------------------------------------------------------------------------------------------------------*/

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auto problem')
        .setDescription('あなたの最近のパフォーマンスからおすすめの問題を選びます！')
        .addIntegerOption(option =>
            option.setName('low')
                .setDescription('選ばれる問題のdiff下限値')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('high')
                .setDescription('選ばれる問題のdiff下限値')
                .setRequired(true)
        ),
    async execute(interaction) {
        const low = interaction.option.getInteger('low');
        const high = interaction.option.getInteger('high');
        
        const problemList = interaction.client.problemList;
        if (!problemList || problemList.length === 0) {
            await interaction.reply('問題リストが読み込まれていません。 \n<@alllllllllly_>に文句を言ってください。');
            return;
        }

        await interaction.deferReply();
        try {
            await interaction.followUp(`推定difficulty:${low}~${high}の問題を検索中...`);
            const problem = pickRandomProblem(low, high);
            if (!problem) {
                await interaction.followUp(`推定difficulty:${low}~${high}の問題は見つかりませんでした。`);
                return;
            }
            const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
            await interaction.followUp(`推定difficulty:${low}~${high}の問題を選びました！ \n頑張ってください！ \n問題: <${link}>（推定difficulty:${problem[2]})`);
         } catch (err) {
            await interaction.followUp(`${err.message} \nエラーが発生しました。allllllllllyの対応をお待ち下さい。`);
        }
    }
};