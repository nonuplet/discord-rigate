import Parser from "rss-parser";
import * as fs from "fs";

export interface RssSource {
  title: string;
  rss: string;
  channelId: string;
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
   * (Only RSS1.0 supported)
   * TODO: rss2
   */
  async getFeeds(): Promise<RssSource[]> {
    const result = [] as RssSource[];
    const sources = JSON.parse(
      fs.readFileSync("rss.json", "utf8"),
    ) as RssSource[];

    // Get RSS
    for (const source of sources) {
      const data = await this.parser.parseURL(source.rss);
      // RSS1.0
      source.feeds = this.#parseRss1(data);
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
        date: feed.date,
        link: feed.link,
      });
    }
    console.log(result);
    return result;
  }
}
