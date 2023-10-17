import "dotenv/config";
import { RssReader } from "./RssReader.js";
import { Client, GatewayIntentBits } from "discord.js";
import { Rigate } from "./Rigate.ts";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rigate = new Rigate(client);
const rssReader = new RssReader();

client.on("ready", () => {
  if (client.user === null) {
    console.error("Login failed");
    process.exit(1);
  }
});

void (async () => {
  await client.login(process.env.DISCORD_BOT_TOKEN);
  await rssReader.sendFeedMessage(rigate);
  process.exit();
})();
