# osu-batchDL
Simple Node.js program to download a list of osu! beatmaps

Why?
----
I created this small program in less than 3 hours because I had to download over 100 maps and didn't want to do it manually lol.

How to use
----
1. Install Node.js on your device if you don't have it installed.

2. Clone this repository and open it in a command line (`bash`, `cmd`, etc)

3. Run `npm install`

4. Edit the config file with your credentials.

5. Run `node index.js <beatmap list file>`.

**Note**: don't move or delete the `maps` folder in the root directory, otherwise the program will throw an error. You can move the downloaded beatmaps anywhere you want, but the `maps` folder has to be present for the program to work.

Configuration file
----
The config.json file located in the root folder is the only configuration file that you'll need to edit. It has five configuration options:

* `username` and `password`: your osu! username and password.

* `token`: your osu! API key. If you don't have one, you can get it at https://osu.ppy.sh/p/api

* `noVideo`: set to 0 if you want to download beatmaps with video, and set to 1 if you prefer downloads without video.

* `maxThreads`: the number of simultaneous download. It's recommended to not use a number above 4, as you may get temporarily banned from using the API if you do so.

Beatmap list file
----
The beatmap list file is a simple .txt file with beatmap links, one for line. The links can be beatmap links, or beatmap sets links.

Example:

```
https://osu.ppy.sh/b/81805
https://osu.ppy.sh/b/88021
https://osu.ppy.sh/b/787816
https://osu.ppy.sh/b/899462
https://osu.ppy.sh/b/1192433
https://osu.ppy.sh/b/1294195
```