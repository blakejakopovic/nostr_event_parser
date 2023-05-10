const event_raw: string = '{"pubkey":"957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8","content":"A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds.  #Bitcoin price is now: $28,111.64","id":"89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f","created_at":1683732497,"sig":"b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938","kind":1,"tags":[["p", "PUBKEY1"],["g", "blabla"],["p", "PUBKEY2"]]}';

const hashtag_regex = /\#[a-zA-Z][0-9a-zA-Z_]*/g;
const hashtag_url_pattern = "http://nostr.hashtag.com/search/%s"

const mention_regex = /\#\[([0-9]+)\]/g;
const mention_url_pattern = "http://nostr.profile.com/pubkey/%s"

const url_regex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;

const metdata_url_pattern = "https://urlpreview.vercel.app/api/v1/preview?url=%s"

const fetch_url_content_type = true
const fetch_url_metadata = true

interface NostrEvent {
  pubkey: string;
  content: string;
  id: string;
  created_at: number;
  sig: string;
  kind: number;
  tags: string[];
}

interface ParsedHashtag {
  hashtag: string;
  url: string;
}

interface ParsedUrl {
  url: string;
  content_type: null | string;
  title: null | string;
  description: null | string;
  image: null | string;
}

interface fetchUrlMetadataResult {
  title: null | string;
  description: null | string;
  image: null | string;
}

interface ParsedMention {
  source: null | string;
  pubkey: null | string;
  relays: string[];
  name: null | string;
  display_name: null | string;
  url: null | string;
}

interface ParsedNostrEvent {
  event: NostrEvent;
  html_content: string;
  hashtags: ParsedHashtag[];
  mentions: ParsedMention[];
  urls: ParsedUrl[];
}

function createDefaultResult(event: NostrEvent): ParsedNostrEvent {
  return {
    event: event,
    html_content: event.content,
    hashtags: [],
    mentions: [],
    urls: []
  };
}

function extractHashtags(parsed_event: ParsedNostrEvent): ParsedNostrEvent {
  const event_content = parsed_event.event.content;
  const parsed_hashtags: ParsedHashtag[] = [];

  let match;
  while ((match = hashtag_regex.exec(event_content)) !== null) {
    let hashtag_url = hashtag_url_pattern.replace('%s', match[0])

    parsed_hashtags.push({
      hashtag: match[0],
      url: hashtag_url
    });

    parsed_event.html_content = parsed_event.html_content.replace(match[0], `<a href="${hashtag_url}">${match[0]}</a>`);
  }
  parsed_event.hashtags = parsed_hashtags

  return parsed_event
}

function getNthPTag(event: NostrEvent, n: number): string | null {
  let pCount = 0;
  let tags = event.tags;
  for (let i = 0; i < tags.length; i++) {
    const [key, value] = tags[i];
    if (key === "p") {
      pCount++;
      if (pCount === n) {
        return value;
      }
    }
  }
  return null;
}

// Deprecated: NIP-08
function extractMentions(parsed_event: ParsedNostrEvent): ParsedNostrEvent {
  const event_content = parsed_event.event.content;
  const parsed_mentions: ParsedMention[] = [];

  const tags = parsed_event.event.tags;

  let match;
  while ((match = mention_regex.exec(event_content)) !== null) {

    let pubkey = getNthPTag(parsed_event.event, parseInt(match[1]) + 1) || '' // should fallback to null

    // TODO: Here we would query relays to lookup the kind0 event for this pubkey

    let mention_url = mention_url_pattern.replace('%s', pubkey) // should fallback to null

    parsed_mentions.push({
        source: match[0],
        pubkey: pubkey,
        relays: [],
        url: mention_url,
        name: null,
        display_name: null
    });

    parsed_event.html_content = parsed_event.html_content.replace(match[0], `<a href="${mention_url}">${pubkey}</a>`);
  }
  parsed_event.mentions = parsed_mentions

  return parsed_event
}

// TODO: Add support for NIP-27
// https://github.com/nostr-protocol/nips/blob/4208652dc7a39c63c39559b13c656ec30400fcba/27.md
// nostr:note1
// nostr:nevent1
// nostr:naddr1

async function getContentType(url: string): Promise<string> {
    const response = await fetch(url, {
        method: 'HEAD'
    });
    return response.headers.get('Content-Type') ?? '';
}

async function fetchUrlMetadata(url: string): Promise<fetchUrlMetadataResult> {

    let request_url = metdata_url_pattern.replace('%s', encodeURI(url));

    const response = await fetch(request_url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    return (await response.json()) as fetchUrlMetadataResult;
}

async function extractUrls(parsed_event: ParsedNostrEvent): Promise<ParsedNostrEvent> {
    const event_content = parsed_event.event.content;
    const parsed_urls: ParsedUrl[] = [];

    let match;
    while ((match = url_regex.exec(event_content)) !== null) {

        let url = match[0];

        let url_content_type = null;
        if (fetch_url_content_type) {
          url_content_type = await getContentType(url);
        }

        // Here we optionally query metadate for this url
        let urlMetadata: fetchUrlMetadataResult = {
          title: null,
          description: null,
          image: null,
        };
        if (fetch_url_metadata) {
          urlMetadata = await fetchUrlMetadata(url);
        }

        parsed_urls.push({
            url: url,
            content_type: url_content_type ?? null,
            title: urlMetadata.title ?? null,
            description:urlMetadata.description ?? null,
            image: urlMetadata.image ?? null
        });

        parsed_event.html_content = parsed_event.html_content.replace(url, `<a href="${url}">${url}</a>`);
    }
    parsed_event.urls = parsed_urls;

    return parsed_event;
}

let event_object: NostrEvent = JSON.parse(event_raw);
let parsed_event: ParsedNostrEvent = createDefaultResult(event_object);


async function main() {
  extractHashtags(parsed_event);
  extractMentions(parsed_event);
  await extractUrls(parsed_event);

  console.log(parsed_event);
}

main();
