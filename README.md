# Nostr Event Parser

Proof of concept nostr typescript event parser to extract metadata, and aid in rendering html or general data processing.

## Features
* Extract bech32-encoded entities (and convert to html a tags)
* Extract hashtags (and convert to html a tags)
* Extract mentions (and convert to html a tags)
* Extract relays (from r tags)
* Extract events (from e tags)
* Extract urls (fetch content-type, preview metadata, and convert to html a tags)
* Custom URL handlers

## Future
* Refactor into a library
* Query relays for mention pubkey kind0 metadata (possible caching)
* Event query/lookup (with optional author/pubkey lookup)
* Handle different event kinds
* Ideally more information on image urls like dimentions

### Usage
```bash
npx ts-node index.ts
# or whatever makes you happy
```

### Example Input
```json
{
    "pubkey": "957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8",
    "content": "A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 nostr:nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds. nostr:npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6!\\n\\nnostr:note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky #Bitcoin price is now: $28,111.64 nostr:naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx",
    "id": "89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f",
    "created_at": 1683732497,
    "sig": "b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938",
    "kind": 1,
    "tags": [["p","PUBKEY1"],
             ["g","blabla"],
             ["p","PUBKEY2"],
             ["e","ROOT_EVENT_ID","root"],
             ["e","REPLY_EVENT_ID","reply"],
             ["e","RANDOM_EVENT_ID"]
             ["r", "wss://relay.nostr.com"]
           ]
}
```


### Example Output
```javascript
{
  event: {
    pubkey: '957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8',
    content: 'A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 nostr:nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds. nostr:npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6!\n' +
      '\n' +
      'nostr:note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky #Bitcoin price is now: $28,111.64 nostr:naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx',
    id: '89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f',
    created_at: 1683732497,
    sig: 'b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938',
    kind: 1,
    tags: [
      [ 'p', 'PUBKEY1' ],
      [ 'g', 'blabla' ],
      [ 'p', 'PUBKEY2' ],
      [ 'e', 'ROOT_EVENT_ID', 'root' ],
      [ 'e', 'REPLY_EVENT_ID', 'reply' ],
      [ 'e', 'RANDOM_EVENT_ID' ],
      [ 'r', 'wss://relay.nostr.com' ]
    ]
  },
  html_content: 'A Credit Crunch Is <a href="http://nostr.profile.com/pubkey/PUBKEY1">PUBKEY1</a> InevitableRigged <a href="http://nostr.profile.com/pubkey/PUBKEY2">PUBKEY2</a> System! <a href="https://i.stack.imgur.com/Ge37s.png">https://i.stack.imgur.com/Ge37s.png</a> <a href="http://nostr.hashtag.com/search/#CreditCrunch">#CreditCrunch</a>📉 <a href="http://nostr.hashtag.com/search/#Infowars">#Infowars</a>👊 <a href="http://nostr.profile.com/pubkey/nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p">nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p</a> <a href="https://www.infowars.com/posts/a-credit-crunch-is-inevitable">https://www.infowars.com/posts/a-credit-crunch-is-inevitable</a> <a href="http://nostr.hashtag.com/search/#Zap">#Zap</a> to support, DM to suggest new feeds. <a href="http://nostr.profile.com/pubkey/npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6">npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6</a>!\n' +
    '\n' +
    '<a href="http://nostr.event.com/event/note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky">http://nostr.event.com/event/note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky</a> <a href="http://nostr.hashtag.com/search/#Bitcoin">#Bitcoin</a> price is now: $28,111.64 <a href="http://nostr.event.com/event/naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx">http://nostr.event.com/event/naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx</a>',
  hashtags: [
    {
      hashtag: '#CreditCrunch',
      url: 'http://nostr.hashtag.com/search/#CreditCrunch'
    },
    {
      hashtag: '#Infowars',
      url: 'http://nostr.hashtag.com/search/#Infowars'
    },
    { hashtag: '#Zap', url: 'http://nostr.hashtag.com/search/#Zap' },
    {
      hashtag: '#Bitcoin',
      url: 'http://nostr.hashtag.com/search/#Bitcoin'
    }
  ],
  mentions: [
    {
      source: '#[0]',
      pubkey: 'PUBKEY1',
      relays: [],
      url: 'http://nostr.profile.com/pubkey/PUBKEY1',
      name: null,
      display_name: null
    },
    {
      source: '#[1]',
      pubkey: 'PUBKEY2',
      relays: [],
      url: 'http://nostr.profile.com/pubkey/PUBKEY2',
      name: null,
      display_name: null
    },
    {
      source: 'nostr:nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p',
      pubkey: 'nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p',
      relays: [ 'wss://r.x.com', 'wss://djbas.sadkb.com' ],
      url: 'http://nostr.profile.com/pubkey/nprofile1qqsrhuxx8l9ex335q7he0f09aej04zpazpl0ne2cgukyawd24mayt8gpp4mhxue69uhhytnc9e3k7mgpz4mhxue69uhkg6nzv9ejuumpv34kytnrdaksjlyr9p',
      name: null,
      display_name: null
    },
    {
      source: 'nostr:npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6',
      pubkey: 'npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6',
      relays: [],
      url: 'http://nostr.profile.com/pubkey/npub108pv4cg5ag52nq082kd5leu9ffrn2gdg6g4xdwatn73y36uzplmq9uyev6',
      name: null,
      display_name: null
    }
  ],
  urls: [
    {
      url: 'https://i.stack.imgur.com/Ge37s.png',
      content_type: 'image/png',
      title: null,
      description: null,
      image: null
    },
    {
      url: 'https://www.infowars.com/posts/a-credit-crunch-is-inevitable',
      content_type: 'text/html; charset=utf-8',
      title: 'A Credit Crunch Is Inevitable',
      description: 'The combination of higher rates and declining optimism about the economy, plus slumps in equity, private investments, and bond valuations, is going to inevitably lead to a massive crunch in access to credit and financing',
      image: 'https://api-assets.infowars.com/2023/05/051023crunch.jpg'
    }
  ],
  events: [
    {
      source: 'e-tag-root',
      note: 'ROOT_EVENT_ID',
      event_id: null,
      relays: [],
      author: null
    },
    {
      source: 'e-tag-reply',
      note: 'REPLY_EVENT_ID',
      event_id: null,
      relays: [],
      author: null
    },
    {
      source: 'e-tag',
      note: 'RANDOM_EVENT_ID',
      event_id: null,
      relays: [],
      author: null
    },
    {
      source: 'nostr:note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky',
      note: 'note1gmtnz6q2m55epmlpe3semjdcq987av3jvx4emmjsa8g3s9x7tg4sclreky',
      event_id: null,
      relays: [],
      author: null
    }
  ],
  event_addresses: [
    {
      source: 'nostr:naddr1qqrxyctwv9hxzq3q80cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsxpqqqp65wqfwwaehxw309aex2mrp0yhxummnw3ezuetcv9khqmr99ekhjer0d4skjm3wv4uxzmtsd3jjucm0d5q3vamnwvaz7tmwdaehgu3wvfskuctwvyhxxmmd0zfmwx',
      pubkey: '3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d',
      kind: 30023,
      identifier: 'banana'
    }
  ],
  relays: [ { source: 'r-tag', url: 'wss://relay.nostr.com' } ]
}
```
