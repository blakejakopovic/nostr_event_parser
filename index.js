"use strict";
const event_raw = '{"pubkey":"957dd3687817abb53e01635fb4fc1c029c2cd49202ec82f416ec240601b371d8","content":"A Credit Crunch Is Inevitable\n\nRigged System! #CreditCrunch📉 #Infowars👊\nhttps:\/\/www.infowars.com\/posts\/a-credit-crunch-is-inevitable\n\n#Zap to support, DM to suggest new feeds.  #Bitcoin price is now: $28,111.64","id":"89161c22883446d7d774fb288db216c2d20f799dbf3e9e4a140f4319094d1a6f","created_at":1683732497,"sig":"b5f75cb1009594b294c07cd9e4b770f16c3f5a95095552cd2745ba71c50a1c11393c63745412692eb17453e43ff02fdbef9b69752280ccb60b7ba20912d3d938","kind":1,"tags":[]}';
let event_object = JSON.parse(event_raw);
const hashtag_regex = new RegExp('\#[a-zA-Z][0-9a-zA-Z_]*');
let event_content = event_object.content;
let result = {};
event_content.match(hashtag_regex).forEach((element) => {
    console.log(element);
});
