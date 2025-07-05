const { SlashCommandBuilder } = require('discord.js');

const RATING_LOWER_MARGIN = 100;
const RATING_HIGHER_MARGIN = 200;
const lately = 15;

// fetchUserRating: AtCoderの最新レート取得
async function fetchUserRating(username) {
    const url = `https://atcoder.jp/users/${username}/history/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ユーザーの記録の取得に失敗しました。: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No history data');
    let lately_Perf=0;
    if (data.length < lately) {
        for (let i=0; i<data.length; i++) {
            lately_Perf+=data[i].Performance;
        }
        lately_Perf/=data.length;
    }
    else {
        for (let i=data.length-lately; i<data.length; i++) {
            lately_Perf+=data[i].Performance;
        }
        lately_Perf/=lately;
    }
    return lately_Perf;
}

// pickRandomProblem: レート近辺の問題を1問選ぶ
function pickRandomProblem(problemList, lately_Perf) {
    const low = lately_Perf - RATING_LOWER_MARGIN;
    const high = lately_Perf + RATING_HIGHER_MARGIN;
    const candidates = problemList.filter(
        p => p[2] >= low && p[2] <= high
    );
    if (candidates.length === 0) return null;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return choice;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('problem')
        .setDescription('あなたの最近のパフォーマンスからおすすめの問題を選びます！')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('あなたののAtCoderユーザー名')
                .setRequired(true)
        ),
    async execute(interaction) {
        const username = interaction.options.getString('username');
        const problemList = interaction.client.problemList;
        if (!problemList || problemList.length === 0) {
            await interaction.reply('問題リストが読み込まれていません。 \n<@alllllllllly_>に文句を言ってください。');
            return;
        }

        await interaction.deferReply();
        try {
            await interaction.followUp(`${username}さんの直近平均パフォーマンスを取得中...`);
            const lately_Perf = await fetchUserRating(username);
            const problem = pickRandomProblem(problemList, lately_Perf);
            if (!problem) {
                await interaction.followUp(`${username}さん(直近平均パフォーマンス:${lately_Perf})におすすめの問題が見つかりませんでした。\n<@alllllllllly_> にキレてください。`);
                return;
            }
            const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
            await interaction.followUp(`${username}さん(直近平均パフォーマンス:${lately_Perf})におすすめの問題を選びました！ \n頑張ってください！ \n問題: <${link}>（推定difficluty:${problem[2]})`);
        } catch (err) {
            console.error(err);
            if (err.message === 'No history data') {
                await interaction.followUp('入力されたAtCoderアカウントに記録がありません。\nユーザー名の打ち間違いをご確認ください。');
            } else {
                await interaction.followUp(`エラー発生… ${err.message} \n<@alllllllllly_> の対応をお待ち下さい。`);
            }
        }
    }
};