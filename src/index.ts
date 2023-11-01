import "dotenv/config";
import { RssReader } from "./RssReader.js";
import { Client, GatewayIntentBits } from "discord.js";
import { Rigate } from "./Rigate.js";
import * as ff from "@google-cloud/functions-framework";

ff.http("RigateFunction", async (req: ff.Request, res: ff.Response) => {
  try {
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
        res.end();
      }
    });

    await client.login(process.env.DISCORD_BOT_TOKEN);
    await rssReader.sendFeedMessage(rigate);
    await client.destroy();
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).send("something went wrong.");
  }
});
