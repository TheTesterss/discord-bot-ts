import {
    APIApplicationCommandOptionChoice,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    ChannelType,
    ChatInputCommandInteraction,
    LocalizationMap,
    MessageContextMenuCommandInteraction,
    PermissionResolvable,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    UserContextMenuCommandInteraction
} from 'discord.js';
import Self from '../classes/Self';
import Database from '../modules/Database';
import { LangTypes } from './options';

export interface CommandInterface {
    name: string;
    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    options?: CommandOptionsInterface[];
    customOptions?: CommandCustomOptionsInterface;
    types?: ApplicationCommandType[];
    integrations?: ApplicationIntegrationType[];
    managedOptions?: CommandManagedOptionsInterface;
    en?: (
        self: Self,
        db: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ) => void | Promise<void>;
    fr?: (
        self: Self,
        db: Database,
        interaction:
            | ChatInputCommandInteraction
            | UserContextMenuCommandInteraction
            | MessageContextMenuCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ) => void | Promise<void>;
}

export interface CommandOptionsInterface {
    name: string;
    nameLocalizations?: LocalizationMap;
    description?: string;
    descriptionLocalizations?: LocalizationMap;
    type: ApplicationCommandOptionType;
    required: boolean;
    // ? String
    autocomplete?: boolean;
    maxLength?: number;
    minLength?: number;
    choices: (APIApplicationCommandOptionChoice<string> & APIApplicationCommandOptionChoice<number>)[];
    // ? Number
    maxValue?: number;
    minValue?: number;
    // ? Channel
    channelTypes?: (
        | ChannelType.GuildText
        | ChannelType.GuildVoice
        | ChannelType.GuildCategory
        | ChannelType.GuildAnnouncement
        | ChannelType.AnnouncementThread
        | ChannelType.PublicThread
        | ChannelType.PrivateThread
        | ChannelType.GuildStageVoice
        | ChannelType.GuildForum
        | ChannelType.GuildMedia
    )[];
    // ? SubCommand | SubCommandGroup
    options?: CommandOptionsInterface[];
}

// TODO: Premium acceptance && Voice acceptance
export interface CommandCustomOptionsInterface {
    blacklistDisallowed?: boolean;
    forGuildOwnerOnly?: boolean;
    forGuildAdminsOnly?: boolean;
    forBotOwnerOnly?: boolean;
}

export interface CommandManagedOptionsInterface {
    allowDms?: boolean;
    clientRequiredPermissions?: Array<PermissionResolvable>;
    userRequiredPermissions?: Array<PermissionResolvable>;
    ephemeralSending?: boolean;
    isNSFW?: boolean;
}

export type CommandOptionsManagerResolvable = SlashCommandBuilder | SlashCommandSubcommandBuilder;
export type InteractionsResolvable =
    | ChatInputCommandInteraction
    | UserContextMenuCommandInteraction
    | MessageContextMenuCommandInteraction;
