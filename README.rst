Fat Beagle
==========
Fat Beagle is a Chrome Extension that collects URLs being accessed while the user browses the Internet. It specifically looks for scripts, domains and asynchronous requests. Once those items are collected, they are saved within local storage and later sent in bulk to a remote web server.

Current supported collection methods:

- Manual submission via pop-up menu
- Automatic URL extract from web pages being browsed
- Automatic URL, host and IP address extraction from raw network requests
- Right-click context menu to submit links embedded in pages

For more information, see the release blog post: 

https://medium.com/@9bplus/fatbeagle-automated-url-collection-e116669e412c

Why
---
Browsing websites produces hundreds of URLs, many of which may be of interest to security researchers. Collecting these URLs gives the researcher an advantage on potentially seeing new hosts or content that may have otherwise gone unnoticed. Having a local toolset that's built into the browser is also helpful in events that an analyst finds something interesting and wants to preserve it for later investigation.

Configuration
-------------
You can install the extension here: 
https://chrome.google.com/webstore/detail/fatbeagle/enmebdiokjodcejfakkiadnfijepfkmn

Users can configure Fat Beagle with a profile name, URL, token and private key for the a remote server. Additional options allow for the user to turn on or off specific extension capabilities.

FAQ
---

**Does FatBeagle include personal information?**
No. This extension will only send network information to remote servers for which it is permitted.

**Can I run FatBeagle just for manual submissions?**
Yes. By default, FatBeagle is configured to only send data when the user explicitly forces it to be sent.

**Won't this generate a lot of noise?**
Without filters and pruning, yes it would. FatBeagle uses a simple state machine in order to identify hosts that appear at a higher frequency. These items are removed from submissions in order to not overwhelm our crawlers.

**Can I send ideas to improve this extension?**
Absolutely, submit a pull request or issues.
