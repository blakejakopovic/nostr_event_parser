"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const event_raw = '{"pubkey":"957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8","content":"A Credit Crunch Is #[0] InevitableRigged #[1] System! https://i.stack.imgur.com/Ge37s.png #CreditCrunch📉 #Infowars👊 https://www.infowars.com/posts/a-credit-crunch-is-inevitable #Zap to support, DM to suggest new feeds.  #Bitcoin price is now: $28,111.64","id":"89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f","created_at":1683732497,"sig":"b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938","kind":1,"tags":[["p", "PUBKEY1"],["g", "blabla"],["p", "PUBKEY2"]]}';
const hashtag_regex = /\#[a-zA-Z][0-9a-zA-Z_]*/g;
const hashtag_url_pattern = "http://nostr.hashtag.com/search/%s";
const mention_regex = /\#\[([0-9]+)\]/g;
const mention_url_pattern = "http://nostr.profile.com/pubkey/%s";
const url_regex = /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
const metdata_url_pattern = "https://urlpreview.vercel.app/api/v1/preview?url=%s";
const fetch_url_content_type = true;
const fetch_url_metadata = true;
function createDefaultResult(event) {
    return {
        event: event,
        html_content: event.content,
        hashtags: [],
        mentions: [],
        urls: []
    };
}
function extractHashtags(parsed_event) {
    const event_content = parsed_event.event.content;
    const parsed_hashtags = [];
    let match;
    while ((match = hashtag_regex.exec(event_content)) !== null) {
        let hashtag_url = hashtag_url_pattern.replace('%s', match[0]);
        parsed_hashtags.push({
            hashtag: match[0],
            url: hashtag_url
        });
        parsed_event.html_content = parsed_event.html_content.replace(match[0], `<a href="${hashtag_url}">${match[0]}</a>`);
    }
    parsed_event.hashtags = parsed_hashtags;
    return parsed_event;
}
function getNthPTag(event, n) {
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
function extractMentions(parsed_event) {
    const event_content = parsed_event.event.content;
    const parsed_mentions = [];
    const tags = parsed_event.event.tags;
    let match;
    while ((match = mention_regex.exec(event_content)) !== null) {
        let pubkey = getNthPTag(parsed_event.event, parseInt(match[1]) + 1) || ''; // should fallback to null
        // TODO: Here we would query relays to lookup the kind0 event for this pubkey
        let mention_url = mention_url_pattern.replace('%s', pubkey); // should fallback to null
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
    parsed_event.mentions = parsed_mentions;
    return parsed_event;
}
// TODO: Add support for NIP-27
// https://github.com/nostr-protocol/nips/blob/4208652dc7a39c63c39559b13c656ec30400fcba/27.md
// nostr:note1
// nostr:nevent1
// nostr:naddr1
function getContentType(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url, {
            method: 'HEAD'
        });
        return (_a = response.headers.get('Content-Type')) !== null && _a !== void 0 ? _a : '';
    });
}
function fetchUrlMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let request_url = metdata_url_pattern.replace('%s', encodeURI(url));
        const response = yield fetch(request_url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        });
        return (yield response.json());
    });
}
function extractUrls(parsed_event) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const event_content = parsed_event.event.content;
        const parsed_urls = [];
        let match;
        while ((match = url_regex.exec(event_content)) !== null) {
            let url = match[0];
            let url_content_type = null;
            if (fetch_url_content_type) {
                url_content_type = yield getContentType(url);
            }
            // Here we optionally query metadate for this url
            let urlMetadata = {
                title: null,
                description: null,
                image: null,
            };
            if (fetch_url_metadata) {
                urlMetadata = yield fetchUrlMetadata(url);
            }
            parsed_urls.push({
                url: url,
                content_type: url_content_type !== null && url_content_type !== void 0 ? url_content_type : null,
                title: (_a = urlMetadata.title) !== null && _a !== void 0 ? _a : null,
                description: (_b = urlMetadata.description) !== null && _b !== void 0 ? _b : null,
                image: (_c = urlMetadata.image) !== null && _c !== void 0 ? _c : null
            });
            parsed_event.html_content = parsed_event.html_content.replace(url, `<a href="${url}">${url}</a>`);
        }
        parsed_event.urls = parsed_urls;
        return parsed_event;
    });
}
let event_object = JSON.parse(event_raw);
let parsed_event = createDefaultResult(event_object);
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        extractHashtags(parsed_event);
        extractMentions(parsed_event);
        yield extractUrls(parsed_event);
        console.log(parsed_event);
    });
}
main();
