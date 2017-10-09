Fat Beagle
==========
Fat Beagle is a Chrome Extension that collects URLs being accessed while the user browses the Internet. It specifically looks for scripts, domains and asynchronous requests. Once those items are collected, they are saved within local storage and later sent in bulk to the RiskIQ landing page crawler service. 

Current supported collection methods:

- Manual submission via pop-up menu
- Automatic URL extract from web pages being browsed
- Automatic URL, host and IP address extraction from raw network requests
- Right-click context menu to submit links embedded in pages

Why
---
Browsing websites produces hundreds of URLs, many of which may be new to the RiskIQ crawlers. Collecting these URLs gives RiskIQ an advantage on potentially seeing new hosts or content that may have otherwise gone unnoticed. Having a local toolset is also helpful in events that an analyst finds something interesting and wants to quickly send it over to our crawlers. 

Configuration
-------------
Users can configure Fat Beagle with a URL, token and private key for the RiskIQ API. Additional options allow for the user to turn on or off specific extension capabilities. 

FAQ
---

**Does FatBeagle include personal information?**
No. This extension will only send network information to RiskIQ crawlers for which it is permitted.

**Can I run FatBeagle just for manual submissions?**
Yes. By default, FatBeagle is configured to only send data when the user explicitly forces it to be sent.

**Won't this generate a lot of noise?**
Without filters and pruning, yes it would. FatBeagle uses a simple state machine in order to identify hosts that appear at a higher frequency. These items are removed from submissions in order to not overwhelm our crawlers. 

**Can I send ideas to improve this extension?**
Absolutely, contact Brandon Dixon <brandon.dixon@riskiq.net>.
