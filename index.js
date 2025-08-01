const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
client.commands = new Collection();

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
    console.log('スラッシュコマンドを登録しました。');
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
    console.log(`${client.user.tag}としてログインしました。`);
});

const PROBLEM_LIST_URL = 'https://kenkoooo.com/atcoder/resources/problem-models.json';

client.problemList=[];

async function loadProblemList() {
    try {
        const res = await fetch(PROBLEM_LIST_URL);
        const data = await res.json();
        client.problemList = Object.entries(data).map(([key, value]) => {
            const parts = key.split("_");
            if (parts.length !== 2) return null;
            if (parts[0].startsWith("abc")||parts[0].startsWith("arc")||parts[0].startsWith("agc")) {
                const [contest, problem] = parts;
                let diff = value.difficulty;
                diff = Math.round(diff >= 400 ? diff : 400 / Math.exp(1.0 - diff / 400));
                return [contest, `${contest}_${problem}`, diff];
            }
            else return null;
        }).filter(Boolean);
        if (client.problemList.length>0) {
            console.log(`${client.problemList.length}問の問題を読み込みました。`);
        }
        else {
            console.log(`問題を読み込めませんでした。`);
        }
    } catch (err) {
        console.error('問題の読み込みに失敗しました。:', err);
    }
}

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const allowedChannelIds = ["1370774836359467119"];
    if (allowedChannelIds.includes(message.channel.id)) {
        if (content.endsWith("い")) {
            message.channel.send("んぽ！");
        }
        else if (content.endsWith("は")) {
            message.channel.send("っくしょん！");
            const user = client.users.cache.get('1314573718990749807');
            if (Math.random()<0.1) {
                user.send("はっくしょん！");
            }
        }
        else if (content.endsWith("ハ")) {
            message.channel.send("ックション！");
            const user = client.users.cache.get('1314573718990749807');
            if (Math.random()<0.1) {
                user.send("ハックション！");
            }
        }
    }
});

loadProblemList();
client.login(process.env.DISCORD_TOKEN);