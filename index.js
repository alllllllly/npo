require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`ログインしました: ${client.user.tag}`);
});

// 問題一覧URL
const PROBLEM_LIST_URL = 'https://kenkoooo.com/atcoder/resources/problem-models.json';
// レーティング差の閾値
const RATING_MARGIN = 100;

let problemList = [];

// 起動時に問題リストを取得
async function loadProblemList() {
    try {
        const res = await fetch(PROBLEM_LIST_URL);
        const data = await res.json();
        problemList = Object.entries(data).map(([key, value]) => {
            const parts = key.split("_");
            if (parts.length !== 2) return null; // 2つ以外は無効
            const [contest, problem] = parts;
            let diff = value.difficulty;
            diff = Math.round(diff >= 400 ? diff : 400 / Math.exp(1.0 - diff / 400));
            return [contest, `${contest}_${problem}`, diff];
        }).filter(Boolean); // nullを除外
        console.log(`Loaded ${problemList.length} problems.`);
    } catch (err) {
        console.error('Failed to load problem list:', err);
    }
}

// ユーザーの最新レーティングを取得
async function fetchUserRating(username) {
    const url = `https://atcoder.jp/users/${username}/history/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch user history: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('No history data');

    // 最新レート
    const lastEntry = data[data.length - 1];
    return lastEntry.NewRating;
}

// レート近辺の問題をランダムに1問取得
function pickRandomProblem(rating) {
    // レート差±RATING_MARGIN
    const low = rating - RATING_MARGIN;
    const high = rating + RATING_MARGIN;
    const candidates = problemList.filter(
        p =>
            p[2] >= low &&
            p[2] <= high
    );
    console.log(`候補数: ${candidates.length} (rate: ${rating}, low: ${low}, high: ${high})`);
    if (candidates.length === 0) return null;
    const choice = candidates[Math.floor(Math.random() * candidates.length)];
    return choice;
}

// メッセージイベント
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const prefix = 'Npo:getproblems:';  // コマンドプレフィックス
    if (!message.content.startsWith(prefix)) return;

    const username = message.content.slice(prefix.length).trim();
    if (!username) {
        return message.reply('ユーザー名を指定してから実行してください。');
    }

    try {
        await message.channel.send(`@${username} のレーティングを取得中...`);
        const rating = await fetchUserRating(username);
        const problem = pickRandomProblem(rating);
        if (!problem) {
            return message.channel.send(`レート近辺(${rating}±${RATING_MARGIN})の問題が見つかりませんでした。 \n @alllllllllly_ にキレてください。`);
        }
        const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
        return message.channel.send(`推薦問題: <${link}>（推定難易度 ${problem[2]}）`);
    } catch (err) {
        console.error(err);
        if (err.message === 'No history data') { // このエラー絶対多い
            return message.channel.send(`AtCoderアカウントに記録がありません。 \nユーザー名の打ち間違いをご確認ください。`);
        }
        else {
            return message.channel.send(`エラー発生… ${err.message} \n@alllllllllly_ の対応をお待ち下さい。`);
        }
    }
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const allowedChannelIds = ["1370774836359467119"];
    if (allowedChannelIds.includes(message.channel.id)) {
        if (content.endsWith("い")) {
            message.channel.send("んぽ");
        }
    }
});

// 問題リストの取得を忘れずに呼び出す
loadProblemList();
client.login(process.env.DISCORD_TOKEN);