const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'user_data.json');

const LOWER_MARGIN = 50;
const HIGHER_MARGIN = 150;
const lately = 15;

function loadUserData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        } else {
            return {};
        }
    } catch (err) {
        console.error('ユーザーデータの読込エラー:', err);
        return {};
    }
}

async function fetchUserPerf(username) {
    const url = `https://atcoder.jp/users/${username}/history/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ユーザーの記録の取得に失敗しました。: ${res.status}`);
    const data = await res.json();
    const checked_data = data.filter(data => data.IsRated === true);
    if (!Array.isArray(checked_data) || checked_data.length === 0) throw new Error('No Rated History Data');
    let lately_Perf=0;
    if (checked_data.length < lately) {
        for (let i=0; i<checked_data.length; i++) {
            lately_Perf+=checked_data[i].Performance;
        }
        lately_Perf/=checked_data.length;
    }
    else {
        for (let i=checked_data.length-lately; i<checked_data.length; i++) {
            lately_Perf+=checked_data[i].Performance;
        }
        lately_Perf/=lately;
    }
    return Math.round(lately_Perf);
}

function pickRandomProblem(problemList, lately_Perf) {
    const low = lately_Perf - LOWER_MARGIN;
    const high = lately_Perf + HIGHER_MARGIN;
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
        .setName('problem')
        .setDescription('あなたの最近のパフォーマンスからおすすめの問題を選びます！')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('あなたののAtCoderユーザー名')
                .setRequired(false)
        ),
    async execute(interaction) {
        let username = interaction.options.getString('username');
        if (username === null) {
            const userdata = loadUserData();
            const userId = interaction.user.id;
            
            const entry = Object.entries(userdata).find(([discordId, atcoderId]) => {
                const cleanId = discordId.replace(/[<@!>]/g, '');
                return userId === cleanId;
            });
            
            if (entry) {
                username = entry[1];
            } else {
                await interaction.reply(`<@${userId}>さんにAtCoderアカウントが結びつけられていません。\nAtCoderIDをオプションで入力してコマンドを実行してください。`);
                return;
            }
        }
        
        const problemList = interaction.client.problemList;
        if (!problemList || problemList.length === 0) {
            await interaction.reply('問題リストが読み込まれていません。 \n<@alllllllllly_>に文句を言ってください。');
            return;
        }

        await interaction.deferReply();
        try {
            await interaction.followUp(`${username}さんの直近平均パフォーマンスを取得中...`);
            const lately_Perf = await fetchUserPerf(username);
            const problem = pickRandomProblem(problemList, lately_Perf);
            if (!problem) {
                await interaction.followUp(`${username}さん(直近平均パフォーマンス:${lately_Perf})におすすめの問題が見つかりませんでした。\n<@alllllllllly_> にキレてください。`);
                return;
            }
            const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
            await interaction.followUp(`${username}さん(直近平均パフォーマンス:${lately_Perf})におすすめの問題を選びました！ \n頑張ってください！ \n問題: <${link}>（推定difficluty:${problem[2]})`);
         } catch (err) {
            console.error(err);
            if (err.message === 'No Rated History Data') {
                await interaction.followUp(`${username}さんにRatedな参加記録がありません。\nユーザー名の打ち間違いをご確認ください。`);
            } else {
                await interaction.followUp(`エラー発生… ${err.message} \n<@alllllllllly_> の対応をお待ち下さい。`);
            }
        }
    }
};