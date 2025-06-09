const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.once('ready', () => {
    console.log(`ログインしました: ${client.user.tag}`);
});

client.on('messageCreate', message => {
    if (message.author.bot) return;

    const content = message.content.trim();
    const allowedChannelId = "1370774836359467119";
    if (content.endsWith("い") && message.channel.id === allowedChannelId) {
        message.channel.send("んぽ");
    }
});
client.login('DISCORD_TOKEN');
