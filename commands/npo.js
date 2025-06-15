const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('npo')
    .setDescription('"んぽ！"と叫びます。'),
  async execute(interaction) {
    await interaction.reply('んぽ！');
  },
};