import "dotenv/config";
import { RssReader, type WebSite } from "./RssReader.js";
import { Client, GatewayIntentBits, hyperlink } from "discord.js";
import { Rigate } from "./Rigate.ts";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rigate = new Rigate(client);
let websites: WebSite[];

/// RSSデータの取得
const readRss = async (): Promise<void> => {
  const reader = new RssReader();
  websites = await reader.getFeeds();
};

const feedMsg = async (): Promise<void> => {
  let msg = "";
  for (const website of websites) {
    if (website.feeds === undefined) return;

    if (process.env.TARGET_CHANNEL_ID === undefined) {
      throw new Error("Invalid channel id");
    }

    msg += "# " + website.title + "\n";

    for (const feed of website.feeds) {
      const line = hyperlink(feed.title, feed.link) + "\n\n";
      if (msg.length + line.length >= 2000) {
        void rigate.sendMessage(process.env.TARGET_CHANNEL_ID, msg);
        msg = line;
      } else {
        msg += line;
      }
    }
    void rigate.sendMessage(process.env.TARGET_CHANNEL_ID, msg);
  }
};

client.on("ready", () => {
  if (client.user === null) return;
  console.log("logged in");
  void feedMsg();
});

void (async () => {
  await readRss();
  void client.login(process.env.DISCORD_BOT_TOKEN);
})();
