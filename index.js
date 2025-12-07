// index.js
import { Client, GatewayIntentBits, PermissionsBitField, ChannelType } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN = process.env.TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const ROLE_ID = process.env.ROLE_ID;

if (!TOKEN || !CHANNEL_ID || !ROLE_ID) {
    console.error("❌ Перевірте змінні середовища (Secrets) в Replit");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.on("messageCreate", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.content === "!паштет") {
        const member = message.member;
        const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);
        const hasRole = member.roles.cache.has(ROLE_ID);

        if (!isAdmin && !hasRole) {
            return message.reply("❌ У вас нема прав для використання цієї команди.");
        }

        const channel = message.guild.channels.cache.get(CHANNEL_ID);
        if (!channel || channel.type !== ChannelType.GuildText) {
            return message.reply("❌ Канал не знайдено або це не текстовий канал.");
        }

        try {
            const messages = await channel.messages.fetch({ limit: 60 });
            const messagesWithReactions = messages.filter(msg => msg.reactions.cache.size > 0);
            const totalMessages = messagesWithReactions.size;

            const deletePromises = messagesWithReactions.map(msg => 
                msg.reactions.removeAll().catch(err => {
                    console.log(`Помилка видалення реакцій у повідомленні ${msg.id}:`, err.message);
                })
            );

            await Promise.all(deletePromises);

            const reply = await message.reply(`✅ Очищено реакції шайтан машиною Блащини з **${totalMessages} повідомлень** у каналі!`);

            setTimeout(() => {
                reply.delete().catch(err => console.log("Не вдалося видалити повідомлення:", err.message));
            }, 20000);

        } catch (err) {
            console.error("Помилка при очищенні реакцій:", err);
            message.reply("❌ Сталася помилка при очищенні реакцій.");
        }
    }
});

client.login(TOKEN)
    .then(() => console.log("✅ Бот запущено успішно"))
    .catch(err => console.error("❌ Не вдалося підключити бота:", err));
