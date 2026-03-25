<h1 align="center">
 🦫 〢 TEV - Development.
</h1>

Welcome on this page that list every instructions you need to make this program functional. To start, lemme explain what is the goal of this project, how has this be done and every features implemented in this program.

### <a id="summary"></a> SUMMARY

- [Every informations](#infos)
- [Setup](#setup)
- [Author](#author)

### <a id="infos"></a> INFOS

#### First what is TEV Bot?
It is a discord bot that runs using node.js v21.4.0 and discord.js v14.17.0. It can works on lower versions but these are the versions I used. The bot use yarn as the main library manager, using prettier to format well the code and takes its configuration datas from an environment file. Finally the program runs with javascript once compiled from a typescript code. The goal of the bot is clear: works well, runs easily.

#### Which updates I personally want, and what I will have to do?

- `Apis` *By adding some apis, it can makes every one gets some public informations from the bot*.
  - `Exporting` *some datas out of both discord and database datas.*
  - `Extending` *the possibilities of configuration on a future dashboard.*
- `Doc` *Will be important if there's an api coming but also if there're sophisticated sytems.*

#### What's different from others handlers?

- *You can now add custom events to avoid using everytime the same file for the same event.*

```diff
--- Runs new discord events
- Events.InteractionCreate
+ CustomEvents.AutocompleteInteraction
+ CustomEvents.SlashcommandInteraction

--- Runs new events
+ DatabaseEvents.LevelUp
+ DatabaseEvents.ClientBlacklistAdd
```
- *An optimized way to create sub command conditions.*

```diff
--- Before [InteractionCreate.ts]
- if(!interaction.member.voice?.channel) return interaction.reply(...)



--- Now [InteractionCreate.ts]
! You have nothing to change even if you want to add a new precondition.

--- Now [modules/preconditions/VoiceOnly.ts]
+ export default new Precondition("name", (...args) => MessagePayload, (...args) => boolean)
```
- *Use of mongoose to manage a mongodb database.*
  - `schemas` *and* `models`
  - `easy access`

### <a id="setup"></a> SETUP

1) Download [NodeJs](https://nodejs.org)
2) Download these codes and then decompress the zip file.
3) Create an environment file called ".env". Inside of this file put
```env
token=string
owner=string
mongo_uri=string
logchannel=string
dblogchannel=string
```
- To collect the discord token go to this [website](https://discord.com/developers).
- To collect the mongo url go to this [website](https://mongodb.com).
- logchannel corresponds to a discord channel where some errors could be send.
- owner corresponds to a discord user, your own id to be precise.
4) Once downloaded, execute:
```diff
+ yarn install
+ yarn prettier
+ yarn launch
```
5) You know have your bot, full access on it and you can share it to whoever you want.

### <a id="author"></a> AUTHOR

- [TheTesters](https://github.com/TheTesterss)
Only developer that participated on this project.