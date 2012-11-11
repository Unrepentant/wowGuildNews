/* wowGuildNews v1.0 beta
 https://github.com/Mottie/wowGuildNews
 by Rob Garrison (Mottie) MIT licensed.
 Usage:
 $('.news').wowGuildNews({
  show   : 25,
  small  : true,
  region : 'us',
  locale : 'en',
  server : 'Lightning's Blade',
  guild  : 'Our Guild's Name'
 });
*/
/*jshint jquery:true */
/*global escape:true */
;(function($){
	"use strict";
	$.fn.wowGuildNews = function(options){
		return this.each(function(){
			// don't allow multiple instances
			if (this.initialized) { return; }
			var el = this,
			o = $.extend(true, {
				// ** Appearance **
				// number of news items to show; 25 max
				show    : 25,
				// small icon size ( true = 18x18; false = 56x56 )
				// 18x18 and 56x56 are the actual icon image sizes, adjust as desired in the css
				small   : true,

				// ** Guild Info ***
				// battlenet domain - "us", "eu", "kr", "tw" or "sea"; use "cn" for china
				region  : 'us',
				// locale - "en", "es", "pt", "en", "fr", "ru", "de", "it", "ko" or "zh"
				locale  : 'en',
				// game server name; include spaces and apostrophes
				server  : "Lightning's Blade",
				// guild name; include spaces and apostrophes
				guild   : "Our Guild's Name",

				// *** text language ***
				text : {
					// guild info
					"guildinfo" : "(Level {level} {faction} Guild, {server})",
					"faction"   : [ "Alliance", "Horde" ],

					// news listing
					// [icon] Fred purchased [Foo]. 1 hour ago.
					// [icon] Barney crafted [Bar]. Yesterday.
					// [icon] Dino earned the achievement [Bark] for 10 points. 45 minutes ago.
					// [icon] The guild earned the acheivement [Super Cool] for 10 points. Just now.
					"item"      : "{icon} {player} {action} {item}. {time}",
					"achv"      : "{icon} {player} earned the achievement {ach} for {points} points. {time}",

					// item actions; replaces {action} above
					"obtained"  : "obtained",
					"crafted"   : "crafted",
					"purchased" : "purchased",

					// guild achievement
					// (replaces {player} for guild achievements) "The guild earned..."
					"guild"     : "The guild",

					// time
					"recent" : "Recently",
					"now"    : "Just now",
					"min"    : "1 minute ago",
					"mins"   : "minutes ago",
					"hour"   : "1 hour ago",
					"hours"  : "hours ago",
					"yday"   : "Yesterday",
					"days"   : "days ago",
					"weeks"  : "weeks ago"
				},

				// *** tooltip URLs ***
				itemTooltip : "http://{locale}.wowhead.com/item={id}",
				achTooltip  : "http://{locale}.wowhead.com/achievement={id}"

				// ** Callbacks **
				// initialized callback function
				// el = $('.guildnews') - element that the plugin is initialized on
				// initialized: function(el){}

			}, options),

			// blizzard url root
			root = "http://" + (o.region === "cn" ? "www.battlenet.com.cn" : o.region + ".battle.net"),
			// blizzard api
			api = root + "/api/wow/",
			// blizzard character armory
			url = root + "/wow/" + o.locale + "/character/" + escape(o.server.toLowerCase()) + "/",
			// icon url
			iconurl = "http://media.blizzard.com/wow/icons/" + (o.small ? "18" : "56") + "/",
			// class name to set size of news icon
			iconclass = "wow-icon-" + (o.small ? "small" : "large"),
			// tooltip url
			itemTooltip = o.itemTooltip.replace(/\{locale\}/g, (o.locale === "en" ? "www" : o.locale) ),
			achTooltip  = o.achTooltip.replace(/\{locale\}/g, (o.locale === "en" ? "www" : o.locale) ),

			// modified from http://ejohn.org/blog/javascript-pretty-date/
			prettyDate = function(time){
				var date = new Date(time || ""),
				// correct for local time
				l = parseInt(date.toLocaleTimeString().split(':'),10),
				h = date.getHours(),
				n = (h - l !== 0) ? date.getTime(date.setHours(l)) : date.getTime(),
				// get number of minutes
				diff = (((new Date()).getTime() - n) / 1000),
				day_diff = Math.floor(diff / 86400);
				if (day_diff === -1) { return o.text.recent; } // fixes time zone/daylight savings time issue?
				if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 ) { return ''; }
				return day_diff === 0 && (
					diff < 60 && o.text.now ||
					diff < 120 && ' ' + o.text.min ||
					diff < 3600 && Math.floor( diff / 60 ) + ' ' + o.text.mins ||
					diff < 7200 && o.text.hour ||
					diff < 86400 && Math.floor( diff / 3600 ) + ' ' + o.text.hours) ||
					day_diff === 1 && ' ' + o.text.yday ||
					day_diff < 7 && day_diff + ' ' + o.text.days ||
					day_diff < 31 && Math.ceil( day_diff / 7 ) + ' ' + o.text.weeks;
			},

			getWowInfo = function(d){
				// "item"      : "{icon} {player} {action} {item}. {time}",
				// "ach"       : "{icon} {player} earned the achievement {tooltip} for {points} points. {time}",
				var n,
					h = {
						'{player}' : '<a class="wow-character-name" href="' + url + escape(d.character) + '/">' + d.character + '</a>',
						'{time}'   : '<span class="wow-action-time">' + prettyDate(d.timestamp) + '</span>.'
					},
					actn = /\{a\}/g,
					plyr = /\{player\}/gi;

				if (/item/.test(d.type)) {
					// item news
					h['{icon}'] = '<span class="wow-icon ' + iconclass + ' wow-icon-' + d.itemId + '"></span>';
					h['{item}'] = ('<a class="wow-item wow-item-{id}" href="' + itemTooltip + '">item {id}</a>').replace(/\{id\}/g, d.itemId);
					h['{action}'] = '<span class="wow-action-type wow-action-{a}">{a}</span>';
					n = o.text.item.replace(/(\{(icon|player|action|item|time)\})/g, function(m){ return h[m]; });
					/* { "type": "itemLoot", "character": "Zalgattis", "timestamp": 1344860400000, "itemId": 72832 } */
					switch ( d.type ) {
						case 'itemLoot':
							return n.replace(actn, o.text.obtained);
						case 'itemCraft':
							return n.replace(actn, o.text.crafted);
						case 'itemPurchase':
							return n.replace(actn, o.text.purchased);
					}
				} else if (d.achievement) {
					// achievement news
					h['{icon}'] = '<span class="wow-icon ' + iconclass +'"><img class="' + iconclass + '" src="' + iconurl + d.achievement.icon + '.jpg"></span>';
					h['{ach}'] = ('<a class="wow-{a}-achievement" href="' + achTooltip + '">' + d.achievement.title + '</a>').replace(/\{id\}/g, d.achievement.id);
					h['{points}'] = '<span class="wow-points">' + d.achievement.points + '</span>';
					n = o.text.achv.replace(/(\{(icon|ach|points|time)\})/g, function(m){ return h[m]; });
					switch ( d.type ) {
						/* { "type": "playerAchievement", "character": "Talkira", "timestamp": 1344824520000, "achievement": {
						"id": 12, "title": "Level 70", "points": 10, "description": "Reach level 70.", "rewardItems": [], "icon": "achievement_level_70",
						"criteria": [{ "id": 40, "description": "Reach level 70" }] } } */
						case 'playerAchievement':
							return n.replace(plyr, h['{player}']).replace(actn, 'character');
						/* { "type": "guildAchievement", "character": "Dgenerate", "timestamp": 1349835240000, "achievement": {
						"id": 6709, "title": "Sha of Anger Guild Run", "points": 10, "description": "Defeat the Sha of Anger in Kun-Lai Summit while
						in a raid with at least 8 guild members.", "rewardItems": [], "icon": "sha_spell_fire_bluehellfire", "criteria": [],
						"accountWide": false, "factionId": 2 } } */
						case 'guildAchievement':
							return n.replace(plyr, o.text.guild).replace(actn, 'guild');
					}
				}
				return '<span class="unknown">Unknown news item</span>';
			},

			guild = api + "guild/" + escape(o.server) + "/" + escape(o.guild) + "?fields=news&jsonp=?",
			// http://us.battle.net/api/wow/guild/Kil%27Jaeden/Skeletons%20of%20society?fields=news
			// http://eu.battle.net/api/wow/guild/arathi/Skill%20Loading?fields=news
			getLinkInfo = function(d){
				if (d.itemId) {
					$.ajax({
						// http://us.battle.net/api/wow/item/#####
						url      : api + "item/" + d.itemId + "?jsonp=?",
						dataType : 'jsonp',
						async    : true,
						success  : function(data){
							// update icon: http://media.blizzard.com/wow/icons/18/inv_chest_leather_07.jpg
							$('.wow-icon-' + data.id)
								.html('<img class="' + iconclass + '" src="' + iconurl + data.icon + '.jpg" alt="' + data.name + '">');
							// update item name/quality
							$('.wow-item-' + data.id)
								.addClass('q' + data.quality)
								.html( data.name );
						}
					});
				}
			};

			// Build news
			$.getJSON(guild, function(data){
				var i, d = data,
					n = d.news,
					l = Math.min(n.length, o.show),
					t = '<h3 class="wow-guild-name"><a href="' + root + '/wow/' + o.locale + '/guild/' + o.server.toLowerCase().replace(/\s/g,'-').replace(/\'/g,'') +
						'/' + o.guild.replace(/\s/g,'_').replace(/\'/g,'') + '/">' + d.name + '</a></h3><h4 class="wow-guild-info">';

				// "(Level {level} {faction} Guild, {server})" -> "(Level 25 Alliance Guild, Durotan)"
				t += o.text.guildinfo.replace(/(\{(level|faction|server)\})/gi, function(m) {
					return {
						'{level}'   : '<span class="wow-guild-level">' + d.level + '</span>',
						'{faction}' : '<span class="wow-guild-faction">' + o.text.faction[d.side] + '</span>',
						'{server}'  : '<span class="wow-guild-realm">' + d.realm + '</span>'
					}[m]; }) + '</h4>';

				// guild news item
				for (i = 0; i < l; i++) {
					t += '<div class="wow-news-item">' + getWowInfo(n[i]) + '</div>';
				}
				$(el).addClass('wow-guild-news').html(t);
				// update links
				for (i = 0; i < l; i++) {
					getLinkInfo(n[i]);
				}
			});
		});
	};
})(jQuery);