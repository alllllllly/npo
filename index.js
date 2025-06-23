const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
client.commands = new Collection();

// コマンドファイルを読み込む
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  const commands = client.commands.map(cmd => cmd.data.toJSON());
  try {
    await rest.put(
      Routes.applicationGuildCommands('1377513527623024750', '1314530064796225536'),
      { body: commands },
    );
    console.log('スラッシュコマンドを登録しました');
  } catch (error) {
    console.error(error);
  }
})();

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'コマンド実行中にエラーが発生しました。', ephemeral: true });
  }
});

client.once('ready', () => {
    console.log(`ログインしました: ${client.user.tag}`);
});

// 問題一覧URL
const PROBLEM_LIST_URL = 'https://kenkoooo.com/atcoder/resources/problem-models.json';

client.problemList=[];

// 起動時に問題リストを取得
async function loadProblemList() {
    try {
        const res = await fetch(PROBLEM_LIST_URL);
        const data = await res.json();
        client.problemList = Object.entries(data).map(([key, value]) => {
            const parts = key.split("_");
            if (parts.length !== 2) return null;
            const [contest, problem] = parts;
            let diff = value.difficulty;
            diff = Math.round(diff >= 400 ? diff : 400 / Math.exp(1.0 - diff / 400));
            return [contest, `${contest}_${problem}`, diff];
        }).filter(Boolean);
        console.log(`Loaded ${client.problemList.length} problems.`);
    } catch (err) {
        console.error('Failed to load problem list:', err);
    }
}

/*
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
            return message.channel.send(`レート近辺(${rating}±${RATING_MARGIN})の問題が見つかりませんでした。 \n<@alllllllllly_> にキレてください。`);
        }
        const link = `https://atcoder.jp/contests/${problem[0]}/tasks/${problem[1]}`;
        return message.channel.send(`推薦問題: <${link}>（推定難易度 ${problem[2]}）`);
    } catch (err) {
        console.error(err);
        if (err.message === 'No history data') { // このエラー絶対多い
            return message.channel.send(`AtCoderアカウントに記録がありません。 \nユーザー名の打ち間違いをご確認ください。`);
        }
        else {
            return message.channel.send(`エラー発生… ${err.message} \n<@alllllllllly_> の対応をお待ち下さい。`);
        }
    }
});
*/

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