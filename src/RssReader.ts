import Parser from "rss-parser";
import * as fs from "fs";

interface RssSource {
  title: string;
  rss: string;
}

export interface WebSite {
  title: string;
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

  async getFeeds(): Promise<WebSite[]> {
    const result = [] as WebSite[];
    const sources = JSON.parse(
      fs.readFileSync("rss.json", "utf8"),
    ) as RssSource[];

    // Get RSS
    for (const source of sources) {
      const data = await this.parser.parseURL(source.rss);
      // RSS1.0
      const feeds = this.#parseRss1(data);

      result.push({
        title: source.title,
        feeds,
      });
    }
    return result;
  }

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
