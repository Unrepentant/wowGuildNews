# **Features** ([demo](http://Unrepentant.github.com/wowGuildNews/index.html))

* Shows your World of Warcraft guild's news. This includes items obtained, bought or crafted.
* This plugin automatically gets the latest guild information using Blizzard's API.
* Works with any region and language.
* Easy to set up. Add your:
  * Battle net domain
  * locale
  * Server name
  * Guild name
* Supports any language
  * Set up the news item or achievment using a template string.
  * All time is output in human readable format.
* All styling of the guild news can be modified using css.
* Item and achievement tooltips are provided by wowhead.

# **Screenshots**

![news](http://unrepentant.github.com/wowGuildNews/demo/screen1.jpg)

# Playground

* Test the plugin out [here](http://jsfiddle.net/Mottie/nvgXp/4/).
* If it doesn't work after something has changed, click on the [ JSLint ] button at the top. It should show if any problems were introduced in the code.
* If the demo still doesn't work, click [ Update ] and email me a link.

# **Documentation**

* [Setup](https://github.com/Unrepentant/wowGuildNews/wiki/Setup)
* [Options](https://github.com/Unrepentant/wowGuildNews/wiki/Options)
* [Change Log](https://github.com/Unrepentant/wowGuildNews/wiki/Change)

# **Dependencies**

* jQuery 1.2+ (required)

# **Licensing**

* [MIT License](http://www.opensource.org/licenses/mit-license.php).

# **Change Log**

### Version 1.1 beta

* Moved repo: [https://github.com/Unrepentant/wowGuildNews](https://github.com/Unrepentant/wowGuildNews)
* Fixed time stamp issues being about 12 hours off
  * Blizzard is not providing a proper UTC time stamp in their feed, so it isn't being processed properly.
  * Times now show as "future time" as it does in the Warcraft armory's Recent News.
  * Modified the text options to remove "ago" from times.
  * Added `past` text option which now contains the default text `"ago"`.
  * Added `future` text option which contains the default text `"in"` (seen as "in 10 minutes").
* Added a new `showFutureTime` option:
  * Default setting is `true`
  * When `true` times that are shown as "future" times will display as "in ...".
  * When `false`, all future times will just show up as "Recently" (set by the recent text option).

### Vesion 1.0 beta

* Initial release.