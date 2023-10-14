import { type Client, type TextChannel } from "discord.js";

export class Rigate {
  #client: Client;
  constructor(client: Client) {
    this.#client = client;
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    const channel = this.#client.channels.resolve(channelId) as TextChannel;
    await channel.send(message);
  }
}
