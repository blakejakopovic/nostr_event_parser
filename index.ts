import { nip19, nip27 } from "nostr-tools";

import NDK, { NDKUserProfile, GetUserParams, NDKFilter, NDKEvent } from "@nostr-dev-kit/ndk"

// Create a new NDK instance with explicit relays
const ndk = new NDK({ explicitRelayUrls: ["wss://nos.lol", "wss://relay.damus.io"] });

const event_raw: string = '{"pubkey":"957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8","content":"A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 nostr:nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds. nostr:npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6!\\n\\nnostr:note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky #Bitcoin price is now: $28,111.64 nostr:naddr1qqwxxatnw3hk6tt4wfkz6cm4wd6x7erfv9kz6er0d4skjmnnqyghwumn8ghj7mn0wd68ytnhd9hx2tcpremhxue69uhkummnw3ez6ur4vgh8wetvd3hhyer9wghxuet59uq3wamnwvaz7tmjv4kxz7fwdehhxarj9e3xzmny9uqsuamnwvaz7tmwdaejumr0dshsz9thwden5te0wfjkccte9ejxzmt4wvhxjme0qgsvt7mwejrkupzcu0k2nyvwxuxte5mkjqw9s3s9ztl9x7jxukxr3wcrqsqqqa28mh8z8r","id":"89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f","created_at":1683732497,"sig":"b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938","kind":1,"tags":[["p", "b2dd40097e4d04b1a56fb3b65fc1d1aaf2929ad30fd842c74d68b9908744495b"],["g", "blabla"],["p", "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"], ["e", "ROOT_EVENT_ID", "root"], ["e", "REPLY_EVENT_ID", "reply"], ["e", "RANDOM_EVENT_ID"], ["r", "wss://relay.nostr.com"]]}';

const hashtag_regex = /\#[a-zA-Z][0-9a-zA-Z_]*/g;
const hashtag_url_pattern = "http://nostr.hashtag.com/search/%s"

const mention_regex = /\#\[([0-9]+)\]/g;
const mention_url_pattern = "http://nostr.profile.com/pubkey/%s"

const url_regex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;

const metdata_url_pattern = "https://urlpreview.vercel.app/api/v1/preview?url=%s"

const note_url_pattern = "http://nostr.event.com/event/%s"

// Note: These hit the network which make it slower
const fetch_url_content_type = true
const fetch_url_metadata = true
const fetch_mention_profile = true
const fetched_referenced_event = true

interface NostrEvent {
  pubkey: string;
  content: string;
  id: string;
  created_at: number;
  sig: string;
  kind: number;
  tags: string[];
}

interface ParsedRelay {
  source: string;
  url: string;
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
  nip05: null | string;
  about: null | string;
  image: null | string;
  banner: null | string;
  url: null | string;
}

interface ParsedNote {
  source: string;
  note: string;
  event_id: null | string;
  relays: string[];
  author: null | string;
}

interface ParsedEventAddress {
  source: string;
  pubkey: null | string;
  kind: null | number;
  identifier: null | string;
  event: null | NDKEvent;
}

interface ParsedNostrEvent {
  event: NostrEvent;
  html_content: string;
  hashtags: ParsedHashtag[];
  mentions: ParsedMention[];
  urls: ParsedUrl[];
  events: ParsedNote[];
  event_addresses: ParsedEventAddress[];
  relays: ParsedRelay[];
}

function createDefaultResult(event: NostrEvent): ParsedNostrEvent {
  return {
    event: event,
    html_content: event.content,
    hashtags: [],
    mentions: [],
    urls: [],
    events: [],
    event_addresses: [],
    relays: []
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

function getNthTag(tag: string, event: NostrEvent, n: number): string | null {
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
async function extractMentions(parsed_event: ParsedNostrEvent): Promise<ParsedNostrEvent> {
  const event_content = parsed_event.event.content;
  const parsed_mentions: ParsedMention[] = [];

  const tags = parsed_event.event.tags;

  let match;
  while ((match = mention_regex.exec(event_content)) !== null) {

    let pubkey = getNthTag('p', parsed_event.event, parseInt(match[1]) + 1) || '' // should fallback to null

    // TODO: Here we would query relays to lookup the kind0 event for this pubkey

    let mention_url = mention_url_pattern.replace('%s', pubkey) // should fallback to null

    let profile = null;
    if (fetch_mention_profile) {
      profile = await fetchPubkeyProfile({hexpubkey: pubkey})
      // console.log(profile)
    }

    parsed_mentions.push({
        source: match[0],
        pubkey: pubkey,
        relays: [],
        url: mention_url,
        name: profile?.name ?? null,
        display_name: profile?.displayName ?? null,
        nip05: profile?.nip05 ?? null,
        about: profile?.about ?? null,
        image: profile?.image ?? null,
        banner: profile?.banner ?? null
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

async function extractTextNoteReferences(parsed_event: ParsedNostrEvent): Promise<ParsedNostrEvent> {

  const matches = nip27.matchAll(parsed_event.event.content);

  const parsed_mentions: ParsedMention[] = []
  const parsed_notes: ParsedNote[] = []
  const parsed_event_addresses: ParsedEventAddress[] = []

  for (const match of matches) {

    if (match.decoded.type == "npub") {

      let {type, data} = nip19.decode(match.value)
      const pointer = data as nip19.ProfilePointer

      var mention_url = mention_url_pattern.replace('%s', match.value);
      parsed_event.html_content = parsed_event.html_content.replace(match.uri, `<a href="${mention_url}">${match.value}</a>`);

      if (fetch_mention_profile) {
        // TODO: Maybe we can suggest NDK to use the relays here
        let profile = await fetchPubkeyProfile({npub: match.value})
        // console.log(profile)

        parsed_mentions.push({
          source: match.uri,
          pubkey: match.value,
          relays: pointer.relays ?? [],
          url: mention_url,
          name: profile?.name ?? null,
          display_name: profile?.displayName ?? null,
          nip05: profile?.nip05 ?? null,
          about: profile?.about ?? null,
          image: profile?.image ?? null,
          banner: profile?.banner ?? null,
        });
      } else {
        parsed_mentions.push({
          source: match.uri,
          pubkey: match.value,
          relays: pointer.relays ?? [],
          url: mention_url,
          name: null,
          display_name: null,
          nip05: null,
          about: null,
          image: null,
          banner: null,
        });
      }

    } else if (match.decoded.type == "nprofile") {

      let {type, data} = nip19.decode(match.value)
      const pointer = data as nip19.ProfilePointer

      var mention_url = mention_url_pattern.replace('%s', match.value);
      parsed_event.html_content = parsed_event.html_content.replace(match.uri, `<a href="${mention_url}">${match.value}</a>`);

      if (fetch_mention_profile) {
        // TODO: Maybe we can suggest NDK to use the relays here
        let profile = await fetchPubkeyProfile({hexpubkey: pointer.pubkey})

        parsed_mentions.push({
          source: match.uri,
          pubkey: match.value,
          relays: pointer.relays ?? [],
          url: mention_url,
          name: profile?.name ?? null,
          display_name: profile?.displayName ?? null,
          nip05: profile?.nip05 ?? null,
          about: profile?.about ?? null,
          image: profile?.image ?? null,
          banner: profile?.banner ?? null,
        });
      } else {
        parsed_mentions.push({
          source: match.uri,
          pubkey: match.value,
          relays: pointer.relays ?? [],
          url: mention_url,
          name: null,
          display_name: null,
          nip05: null,
          about: null,
          image: null,
          banner: null,
        });
      }

    } else if (match.decoded.type == "note") {

      let {type, data} = nip19.decode(match.value)
      const pointer = data as nip19.EventPointer

      parsed_notes.push({
          source: match.uri,
          note: match.value,
          event_id: pointer.id ?? null,
          relays: pointer.relays ?? [],
          author: pointer.author ?? null,
      })

      var url = note_url_pattern.replace('%s', match.value);
      parsed_event.html_content = parsed_event.html_content.replace(match.uri, `<a href="${url}">${url}</a>`);

    } else if (match.decoded.type == "naddr") {

      let {type, data} = nip19.decode(match.value)
      const pointer = data as nip19.AddressPointer

      // let event: NostrEvent | null = null;
      // if (fetched_referenced_event) {
      //   const filter: NDKFilter = { kinds: [pointer.kind], authors: [pointer.pubkey] };

      //   // Will return only the first event
      //   let event_data = await ndk.fetchEvent(filter);

      //   event = {
      //     pubkey: event_data?.pubkey,
      //     content: event_data?.content,
      //     id: event_data?.id?,
      //     created_at: event_data?.created_at?
      //     sig: event_data?.sig?,
      //     kind: event_data?.kind?,
      //     tags: event_data?.tags?
      //   }
      // }

      parsed_event_addresses.push({
          source: match.uri,
          pubkey: pointer.pubkey ?? null,
          kind: pointer.kind ?? null,
          identifier: pointer.identifier ?? null,
          event: null,
      })

      var url = note_url_pattern.replace('%s', match.value);
      parsed_event.html_content = parsed_event.html_content.replace(match.uri, `<a href="${url}">${url}</a>`);
    }
  }

  parsed_event.mentions = parsed_event.mentions.concat(parsed_mentions);
  parsed_event.event_addresses = parsed_event.event_addresses.concat(parsed_event_addresses);
  parsed_event.events = parsed_event.events.concat(parsed_notes);

  return parsed_event;
}

function extractETags(parsed_event: ParsedNostrEvent): ParsedNostrEvent {

  const parsed_notes: ParsedNote[] = []

  const tags = parsed_event.event.tags;

  for (const tag_arr of tags) {
    if (tag_arr[0] === 'e' && tag_arr.length >= 2) {

      // TODO: Validate e tag format/length

      const event_type = tag_arr.length >= 3 ? (tag_arr[2] === 'root' ? 'root' : 'reply') : null;

      parsed_notes.push({
        source: event_type ? `e-tag-${event_type}` : 'e-tag',
        note: tag_arr[1],
        event_id: null,
        relays: [],
        author: null,
      });

    }
  }

  parsed_event.events = parsed_event.events.concat(parsed_notes);

  return parsed_event
}

function extractRTags(parsed_event: ParsedNostrEvent): ParsedNostrEvent {

  const parsed_relays: ParsedRelay[] = []

  const tags = parsed_event.event.tags;

  for (const tag_arr of tags) {
    if (tag_arr[0] === 'r' && tag_arr.length >= 2) {

      // TODO: Validate r tag with URL regex

      parsed_relays.push({
          source: "r-tag",
          url: tag_arr[1]
      });

    }
  }

  parsed_event.relays = parsed_event.relays.concat(parsed_relays);

  return parsed_event
}

async function fetchPubkeyProfile(params: GetUserParams) {
  const user = ndk.getUser(params);
  await user.fetchProfile();

  return user.profile;
}

let event_object: NostrEvent = JSON.parse(event_raw);
let parsed_event: ParsedNostrEvent = createDefaultResult(event_object);


async function main() {
  await ndk.connect();

  extractETags(parsed_event);
  extractRTags(parsed_event);
  await extractMentions(parsed_event);
  await extractTextNoteReferences(parsed_event);
  extractHashtags(parsed_event);
  await extractUrls(parsed_event);

  // TODO: Convert \n to <br/> for html?
  // TODO: Detect Markdown

  console.dir(parsed_event, {depth: null, colors: true, maxArrayLength: null} );
}

main();
