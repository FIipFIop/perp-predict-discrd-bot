import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  registerCommands();
});

async function registerCommands() {
  const command = new SlashCommandBuilder()
    .setName('perp')
    .setDescription('Analyze a crypto chart with AI')
    .addStringOption(option =>
      option.setName('timeframe')
        .setDescription('Chart timeframe')
        .setRequired(true)
        .addChoices(
          { name: '1 Minute', value: '1m' },
          { name: '5 Minutes', value: '5m' },
          { name: '15 Minutes', value: '15m' },
          { name: '30 Minutes', value: '30m' },
          { name: '1 Hour', value: '1h' },
          { name: '4 Hours', value: '4h' },
          { name: '1 Day', value: '1d' },
          { name: '1 Week', value: '1w' }
        ))
    .addAttachmentOption(option =>
      option.setName('chart')
        .setDescription('Upload your chart image')
        .setRequired(true));

  try {
    await client.application.commands.create(command);
    console.log('✅ Slash command /perp registered');
  } catch (error) {
    console.error('❌ Error registering command:', error);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'perp') return;

  await interaction.deferReply();

  try {
    const timeframe = interaction.options.getString('timeframe');
    const attachment = interaction.options.getAttachment('chart');

    if (!attachment.contentType?.startsWith('image/')) {
      return await interaction.editReply('❌ Please upload an image file (PNG, JPG, WEBP)');
    }

    // Download image and convert to base64
    const imageBuffer = await fetch(attachment.url).then(r => r.arrayBuffer());
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:${attachment.contentType};base64,${base64Image}`;

    // Call OpenRouter API directly
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-nano-12b-v2-vl:free',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: imageUrl } },
            {
              type: 'text',
              text: `Analyze this ${timeframe} crypto chart. Respond ONLY with valid JSON: {"recommendation":"LONG/SHORT","certainty":85,"entryPrice":"$X (desc)","stopLoss":"$X (-X%)","takeProfit":"$X (+X%)","riskRewardRatio":"X:1","report":"Detailed analysis with patterns, SL/TP justification"}. Min 2:1 R:R required.`
            }
          ]
        }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter API error:', error);
      return await interaction.editReply('❌ Failed to analyze chart. Please try again.');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return await interaction.editReply('❌ No response from AI. Please try again.');
    }

    // Parse JSON response
    let analysis;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content);
    } catch (e) {
      analysis = {
        recommendation: content.toUpperCase().includes('LONG') ? 'LONG' : 'SHORT',
        certainty: 75,
        entryPrice: 'See report',
        stopLoss: 'See report',
        takeProfit: 'See report',
        riskRewardRatio: '2:1',
        report: content
      };
    }

    // Ensure all fields exist
    const result = {
      recommendation: analysis.recommendation || 'N/A',
      certainty: analysis.certainty || 0,
      entryPrice: analysis.entryPrice || 'Not specified',
      stopLoss: analysis.stopLoss || 'Not specified',
      takeProfit: analysis.takeProfit || 'Not specified',
      riskRewardRatio: analysis.riskRewardRatio || 'N/A',
      report: analysis.report || content
    };

    // Create embed
    const color = result.recommendation === 'LONG' ? 0x00ff00 : 0xff0000;
    const embed = new EmbedBuilder()
      .setTitle('📊 Crypto Chart Analysis')
      .setColor(color)
      .addFields(
        { name: '📈 Recommendation', value: `**${result.recommendation}**`, inline: true },
        { name: '🎯 Certainty', value: `${result.certainty}%`, inline: true },
        { name: '⚖️ Risk/Reward', value: result.riskRewardRatio, inline: true },
        { name: '🎯 Entry Price', value: result.entryPrice, inline: true },
        { name: '🛑 Stop Loss', value: result.stopLoss, inline: true },
        { name: '💰 Take Profit', value: result.takeProfit, inline: true },
        { name: '📝 Analysis Report', value: result.report.length > 1024 ? result.report.substring(0, 1021) + '...' : result.report }
      )
      .setThumbnail(attachment.url)
      .setFooter({ text: `${timeframe} • Powered by OpenRouter AI • Not financial advice` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });

  } catch (error) {
    console.error('Error:', error);
    await interaction.editReply('❌ An error occurred while analyzing the chart. Please try again.');
  }
});

client.login(process.env.DISCORD_TOKEN);
