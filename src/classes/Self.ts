// ? Imports libraries.
import { ActivitiesOptions, Client, Collection, IntentsBitField } from 'discord.js';
import { EventEmitter } from 'node:events';
import Database from '../modules/Database';
import EventManager from './EventManager';
import CommandManager from './CommandManager';
import { Precondition } from '../modules/Precondition';
import { CommandCustomOptionsInterface } from '../types/commands';

export default class Self extends EventEmitter {
    // ? Public
    public djsClient: Client = new Client({
        allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
        intents: [
            IntentsBitField.Flags.Guilds, // ? Captures guilds.
            IntentsBitField.Flags.GuildMessages, // ? Captures messages in guilds.
            IntentsBitField.Flags.GuildMessageReactions, // ? Captures reactions to messages in guilds.
            IntentsBitField.Flags.GuildMembers, // ? Captures members in guilds.
            IntentsBitField.Flags.GuildVoiceStates, // ? Captures voice states in guilds.
            IntentsBitField.Flags.GuildPresences, // ? Captures presences in guilds.
            IntentsBitField.Flags.GuildWebhooks, // ? Captures webhooks in guilds.
            IntentsBitField.Flags.GuildInvites, // ? Captures invites in guilds.
            IntentsBitField.Flags.GuildIntegrations, // ? Captures integrations in guilds.
            // * DEPRECATED | IntentsBitField.Flags.GuildBans, // ? Captures bans in guilds.
            IntentsBitField.Flags.GuildEmojisAndStickers, // ? Captures emojis and stickers creations/suppressions/updates in guilds.
            IntentsBitField.Flags.GuildMessageTyping, // ? Captures typing events in guilds.
            IntentsBitField.Flags.DirectMessages, // ? Captures messages in dm.
            IntentsBitField.Flags.DirectMessageReactions, // ? Captures reactions to messages in dm.
            IntentsBitField.Flags.DirectMessageTyping, // ? Captures typing events in dm.
            IntentsBitField.Flags.MessageContent // ? Captures the content of messages.
        ]
    });
    public database: Database = new Database(this);
    public eventManager: EventManager = new EventManager(this);
    public commandManager: CommandManager = new CommandManager(this);
    public preconditions: Record<keyof CommandCustomOptionsInterface, Precondition> = {
        blacklistDisallowed: require('../modules/preconditions/forBotOwnerOnly').default,
        forBotOwnerOnly: require('../modules/preconditions/forBotOwnerOnly').default,
        forGuildAdminsOnly: require('../modules/preconditions/forBotOwnerOnly').default,
        forGuildOwnerOnly: require('../modules/preconditions/forBotOwnerOnly').default
    };

    constructor() {
        super({ captureRejections: true });
    }

    public async startClient(token: string): Promise<void> {
        await this.djsClient.login(token);
        await this.eventManager.runEvents();
        await this.commandManager.createCommands();
    }
}
