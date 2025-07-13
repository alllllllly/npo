const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'user_data.json');

function deleteUserData(discordId) {
    try {
        let data = {};
        if (fs.existsSync(DATA_FILE)) {
            data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
        delete data[discordId];
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error('ユーザーデータの削除エラー:', err);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userdelete')
        .setDescription('Discord垢とAtCoder垢を連携を解除します。')
        .addUserOption(option =>
            option.setName('discord_id')
                .setDescription('Discordアカウント')
                .setRequired(true)
        ),
    async execute(interaction) {
        const discordId = interaction.options.getUser('discord_id');
        deleteUserData(discordId);
        await interaction.reply(`Discord ID: ${discordId} の連携を解除しました。`);
    }
};