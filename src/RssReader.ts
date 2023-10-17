import Parser from "rss-parser";
import * as fs from "fs";
import { hyperlink } from "discord.js";
import { type Rigate } from "./Rigate.js";

export interface RssSource {
  title: string;
  rss: string;
  version: number;
  channelId: string;
  bannedWords: string[];
  feeds?: Feed[];
}

interface Feed {
  title: string;
  date: Date;
  link: string;
}

export class RssReader {
  parser;

  constructor() {
    this.parser = new Parser();
  }

  /**
   * Get RSS feeds from rss.json
   */
  async #getFeeds(): Promise<RssSource[]> {
    const result = [] as RssSource[];
    const sources = JSON.parse(
      fs.readFileSync("rss.json", "utf8"),
    ) as RssSource[];

    // Get RSS
    for (const source of sources) {
      const data = await this.parser.parseURL(source.rss);
      if (source.version === 1) {
        source.feeds = this.#parseRss1(data);
      } else {
        source.feeds = this.#parseRss2(data);
      }
      result.push(source);
    }
    return result;
  }

  /**
   * Parse RSS1.0
   * @param data raw object from Parser(rss-parser)
   * @private
   */
  #parseRss1(data: any): Feed[] {
    const result: Feed[] = [];
    for (const feed of data.items) {
      result.push({
        title: feed.title,
        date: new Date(feed.date),
        link: feed.link,
      });
    }
    return result;
  }

  #parseRss2(data: any): Feed[] {
    const result: Feed[] = [];
    for (const feed of data.items) {
      result.push({
        title: feed.title,
        date: new Date(feed.pubDate),
        link: feed.link,
      });
    }
    return result;
  }

  /**
   * Check feed
   * @param feed Target feed
   * @param now Current Date Object
   * @param bannedWords Banned words from rss.json
   * @private
   */
  #checkFeed(
    feed: Feed,
    now: Date,
    bannedWords: string[] | undefined,
  ): boolean {
    // Check pubDate
    if ((now.getTime() - feed.date.getTime()) / (1000 * 60 * 60 * 24) > 1) {
      return false;
    }

    // Check banned words
    if (bannedWords === undefined) return true;
    for (const banned of bannedWords) {
      if (feed.title.includes(banned)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Send feed message to discord channel
   */
  async sendFeedMessage(rigate: Rigate): Promise<void> {
    // get feeds
    const websites = await this.#getFeeds();
    const now = new Date();
    const nowString =
      now.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }) +
      " " +
      now.toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

    // build & send messages
    for (const website of websites) {
      let message = "";
      if (website.feeds === undefined) continue;

      message += "# " + website.title + "\n";
      message += "### Updated: " + nowString + "\n";
      let feedCount = 0;

      for (const feed of website.feeds) {
        if (!this.#checkFeed(feed, now, website.bannedWords)) continue;

        const line = "- " + hyperlink(feed.title, feed.link) + "\n";
        if (message.length + line.length < 2000 && feedCount < 6) {
          message += line;
          feedCount++;
        } else {
          await rigate.sendMessage(website.channelId, message);
          message = line;
          feedCount = 1;
        }
      }
      if (feedCount > 0) {
        await rigate.sendMessage(website.channelId, message);
      }
    }
  }
}
