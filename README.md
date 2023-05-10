# Nostr Event Parser

Proof of concept nostr typescript event parser to extract metadata, and aid in rendering html or general data processing.

## Features
* Extract hashtags (and convert to html a tags)
* Extract mentions (and convert to html a tags)
* Extract urls (fetch content-type, preview metadata, and convert to html a tags)
* Custom URL handlers

## Future
* Refactor into a library
* Query relays for mention pubkey kind0 metadata (possible caching)
* Root event and reply event lookup (with optional pubkey lookup)
* Handle different event kinds
* Support for [NIP-27 - Text Note References](https://github.com/nostr-protocol/nips/blob/4208652dc7a39c63c39559b13c656ec30400fcba/27.md)
* Ideally more information on image urls like dimentions

### Example Input
```json
{
    "pubkey": "957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8",
    "content": "A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds.  #Bitcoin price is now: $28,111.64",
    "id": "89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f",
    "created_at": 1683732497,
    "sig": "b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938",
    "kind": 1,
    "tags":
    [
        [
            "p",
            "PUBKEY1"
        ],
        [
            "g",
            "blabla"
        ],
        [
            "p",
            "PUBKEY2"
        ]
    ]
}
```


### Example Output
```javascript
{
  event: {
    pubkey: '957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8',
    content: 'A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds.  #Bitcoin price is now: $28,111.64',
    id: '89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f',
    created_at: 1683732497,
    sig: 'b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938',
    kind: 1,
    tags: [ ["p","PUBKEY1"], ["g","blabla"], ["p","PUBKEY2"] ]
  },
  html_content: 'A Credit Crunch Is <a href="http://nostr.profile.com/pubkey/PUBKEY1">PUBKEY1</a> InevitableRigged <a href="http://nostr.profile.com/pubkey/PUBKEY2">PUBKEY2</a> System! <a href="https://i.stack.imgur.com/Ge37s.png">https://i.stack.imgur.com/Ge37s.png</a> <a href="http://nostr.hashtag.com/search/#CreditCrunch">#CreditCrunch</a>📉 <a href="http://nostr.hashtag.com/search/#Infowars">#Infowars</a>👊 <a href="https://www.infowars.com/posts/a-credit-crunch-is-inevitable">https://www.infowars.com/posts/a-credit-crunch-is-inevitable</a> <a href="http://nostr.hashtag.com/search/#Zap">#Zap</a> to support, DM to suggest new feeds.  <a href="http://nostr.hashtag.com/search/#Bitcoin">#Bitcoin</a> price is now: $28,111.64',
  hashtags: [
    {
      hashtag: '#CreditCrunch',
      url: 'http://nostr.hashtag.com/search/#CreditCrunch'
    },
    {
      hashtag: '#Infowars',
      url: 'http://nostr.hashtag.com/search/#Infowars'
    },
    {
      hashtag: '#Zap',
      url: 'http://nostr.hashtag.com/search/#Zap' },
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
  ]
}
```
