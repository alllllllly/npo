const { SlashCommandBuilder } = require('discord.js');

const RATING_MARGIN = 100;

// fetchUserRating: AtCoderの最新レート取得
async function fetchUserRating(username) {
    const url = `https://atcoder.jp/users/${username}/history/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch user history: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No history data');
    const lastEntry = data[data.length - 1];
    return lastEntry.NewRating;
}

// pickRandomProblem: レート近辺の問題を1問選ぶ
function pickRandomProblem(problemList, rating) {
    const low = rating - RATING_MARGIN;
    const high = rating + RATING_MARGIN;
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
        .setDescription('あなたのrating値から適正の問題をランダムに提示します。')
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
            await interaction.followUp(`@${username} のレーティングを取得中...`);
            const rating = await fetchUserRating(username);
            const problem = pickRandomProblem(problemList, rating);
            if (!problem) {
                await interaction.followUp(`レート近辺(${rating}±${RATING_MARGIN})の問題が見つかりませんでした。\n<@alllllllllly_> にキレてください。`);
                return;
            }
            const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
            await interaction.followUp(`推薦問題: <${link}>（推定難易度 ${problem[2]}）`);
        } catch (err) {
            console.error(err);
            if (err.message === 'No history data') {
                await interaction.followUp('AtCoderアカウントに記録がありません。\nユーザー名の打ち間違いをご確認ください。');
            } else {
                await interaction.followUp(`エラー発生… ${err.message} \n<@alllllllllly_> の対応をお待ち下さい。`);
            }
        }
    }
};