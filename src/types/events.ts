import {
    AnySelectMenuInteraction,
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ClientEvents,
    CommandInteraction,
    GuildMember,
    MentionableSelectMenuInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction
} from 'discord.js';
import Self from '../classes/Self';
import Database from '../modules/Database';
import { CommandInterface } from './commands';
import { LangTypes } from './options';

export enum EventType {
    CLASSIC = 1,
    CUSTOM = 2,
    DATABASE = 3
}

export enum DatabaseEvents_E {
    OnBlacklistAdd = 'onBlacklistAdd',
    OnBlacklistRemove = 'onBlacklistRemove',
    OnWhitelistAdd = 'onWhitelistAdd',
    OnWhitelistRemove = 'onWhitelistRemove',
    Ready = 'ready'
}

export enum CustomEvents_E {
    SlashCommandExecution = 'slashCommandExecution',
    UserContextCommandExecution = 'userContextCommandExecution',
    MessageContextCommandExecution = 'messageContextCommandExecution',
    ButtonExecution = 'buttonExecution',
    ModalExecution = 'modalExecution',
    AutocompleteExecution = 'autocompleteExecution',
    RoleSelectMenuExecution = 'roleSelectMenuExecution',
    UserSelectMenuExecution = 'userSelectMenuExecution',
    ChannelSelectMenuExecution = 'channelSelectMenuExecution',
    StringSelectMenuExecution = 'stringSelectMenuExecution',
    MentionableSelectMenuoption = 'mentionableSelectMenuExecution',
    AnySelectMenuExecution = 'anySelectMenuExecution'
}

export type EventTypes = 1 | 2 | 3;

export interface EventInterface {
    name: keyof ClientEvents | keyof CustomEvents | keyof DatabaseEvents;
    type: EventTypes;
    once?: boolean; // ? Should the event be only executed once?
    run: (...args: any[]) => void;
}

export interface CustomEvents {
    slashCommandExecution: [
        self: Self,
        db: Database,
        interaction: CommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ];
    userContextCommandExecution: [
        self: Self,
        db: Database,
        interaction: UserContextMenuCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ];
    messageContextCommandExecution: [
        self: Self,
        db: Database,
        interaction: MessageContextMenuCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ];
    buttonExecution: [self: Self, db: Database, interaction: ButtonInteraction, lang: LangTypes];
    modalExecution: [self: Self, db: Database, interaction: ModalSubmitInteraction, lang: LangTypes];
    autocompleteExecution: [self: Self, db: Database, interaction: AutocompleteInteraction, lang: LangTypes];
    roleSelectMenuExecution: [self: Self, db: Database, interaction: RoleSelectMenuInteraction, lang: LangTypes];
    userSelectMenuExecution: [self: Self, db: Database, interaction: UserSelectMenuInteraction, lang: LangTypes];
    channelSelectMenuExecution: [self: Self, db: Database, interaction: ChannelSelectMenuInteraction, lang: LangTypes];
    stringSelectMenuExecution: [self: Self, db: Database, interaction: StringSelectMenuInteraction, lang: LangTypes];
    mentionableSelectMenuExecution: [
        self: Self,
        db: Database,
        interaction: MentionableSelectMenuInteraction,
        lang: LangTypes
    ];
    anySelectMenuExecution: [self: Self, db: Database, interaction: AnySelectMenuInteraction, lang: LangTypes];
}

export interface DatabaseEvents {
    onBlacklistAdd: [self: Self, db: Database, id: string];
    onBlacklistRemove: [self: Self, db: Database, id: string];
    onWhitelistAdd: [self: Self, db: Database, id: string];
    onWhitelistRemove: [self: Self, db: Database, id: string];
    ready: [self: Self, db: Database];
}
