import {
    ApplicationCommandOptionBase,
    ApplicationCommandOptionType,
    ContextMenuCommandType,
    InteractionContextType,
    PermissionsBitField,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandSubcommandGroupBuilder,
    Collection,
    SlashCommandStringOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandUserOption,
    SlashCommandSubcommandBuilder,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
    REST,
    Routes,
    ApplicationCommand,
    GuildResolvable,
    IntegrationApplication,
    ApplicationIntegrationType
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { blue, green, red, yellow } from '../modules/Colors';
import Self from './Self';
import { CommandInterface, CommandOptionsInterface, CommandOptionsManagerResolvable } from '../types/commands';
import { LangTypes, LangType } from '../types/options';

export default class CommandManager {
    // ? Public
    public self: Self;
    public commands: Collection<string, CommandInterface> = new Collection();

    // ? Private
    private errorText: string = '[EPSILON | ERROR]';
    private warningText: string = '[EPSILON | WARNING]';
    private runText: string = '[EPSILON | RUN]';
    private regiteredText: string = '[EPSILON | REGISTERED]';

    constructor(self: Self) {
        this.self = self;
    }

    private async fetchCommands(): Promise<CommandInterface[]> {
        const followedModels: CommandInterface[] = [];

        const track = async (dir: string, lang: LangTypes): Promise<void> => {
            const files: string[] = fs.readdirSync(dir);

            for (const file of files) {
                const fullPath = path.join(dir, file);

                if (!fs.statSync(fullPath).isDirectory()) {
                    const d: CommandInterface = require(fullPath);
                    switch (lang) {
                        case LangType.EN:
                            followedModels.push(d);
                            break;
                        case LangType.FR:
                            const command = followedModels.find((command: CommandInterface) => command.name === d.name);
                            if (command) command.fr = d.fr;
                            break;
                    }
                } else {
                    await track(fullPath, lang);
                }
            }
        };

        await track(path.join(__dirname, '../commands/en'), 'en');
        await track(path.join(__dirname, '../commands/fr'), 'fr');
        for (const model of followedModels) this.commands.set(model.name, model);
        return followedModels;
    }

    private checkCommandValidity(command: CommandInterface): true {
        // ? Classic errors
        if (!command.name) throw new Error(`${red(this.errorText)} | ${red('Event name')} is a required argument.`);
        if (!command.types || command.types.length === 0)
            throw new Error(`${red(this.errorText)} | ${red('Event type')} is a required argument.`);
        if (!command.fr && !command.en)
            throw new Error(`${red(this.errorText)} | You may provide a valid ${red('Event run function')}.`);

        // ? Type errors
        if (!command.types.every((type: ApplicationCommandType) => type in Object.values(ApplicationCommandType)))
            throw new TypeError(
                `${red(this.errorText)} | ${red('Event type')} must be a valid type array. Refer to ${yellow('"CommandType" enum')}.`
            );

        return true;
    }

    public async createCommands(): Promise<void> {
        const followedModels: CommandInterface[] = await this.fetchCommands();
        const commands: any[] = [];
        for (const model of followedModels) {
            this.checkCommandValidity(model);
            const contexts = [InteractionContextType.Guild];
            if (model.managedOptions?.allowDms) contexts.push(InteractionContextType.BotDM);

            for (const type of model.types ?? []) {
                switch (type) {
                    case ApplicationCommandType.ChatInput:
                        const slash = new SlashCommandBuilder()
                            .setName(model.name)
                            .setDescription(model.description ?? 'Pop! This command lost its description.')
                            .setNameLocalizations(model.nameLocalizations!)
                            .setDescriptionLocalizations(
                                model.descriptionLocalizations ?? {
                                    fr: 'Pop ! Cette commande a perdue sa description.'
                                }
                            )
                            .setIntegrationTypes(
                                model.integrations ?? [
                                    ApplicationIntegrationType.GuildInstall,
                                    ApplicationIntegrationType.UserInstall
                                ]
                            )
                            .setNSFW(model.managedOptions?.isNSFW ?? false)
                            .setDefaultMemberPermissions(
                                model.managedOptions?.userRequiredPermissions?.at(0)
                                    ? PermissionsBitField.resolve(model.managedOptions.userRequiredPermissions.at(0))
                                    : null
                            )
                            .setContexts(contexts);
                        const options: CommandOptionsInterface[] = model.options ?? [];
                        for (const option of options) await this.addOption(slash, option);

                        commands.push(slash);
                        break;
                    case ApplicationCommandType.User:
                        const user = new ContextMenuCommandBuilder()
                            .setName(model.name)
                            .setDefaultMemberPermissions(
                                model.managedOptions?.userRequiredPermissions?.at(0)
                                    ? PermissionsBitField.resolve(model.managedOptions.userRequiredPermissions.at(0))
                                    : null
                            )
                            .setContexts(contexts)
                            .setIntegrationTypes(
                                model.integrations ?? [
                                    ApplicationIntegrationType.GuildInstall,
                                    ApplicationIntegrationType.UserInstall
                                ]
                            )
                            .setNameLocalizations(model.nameLocalizations!)
                            .setType(ApplicationCommandType.User as ContextMenuCommandType);

                        commands.push(user);
                        break;
                    case ApplicationCommandType.Message:
                        const message = new ContextMenuCommandBuilder()
                            .setName(model.name)
                            .setDefaultMemberPermissions(
                                model.managedOptions?.userRequiredPermissions?.at(0)
                                    ? PermissionsBitField.resolve(model.managedOptions.userRequiredPermissions.at(0))
                                    : null
                            )
                            .setContexts(contexts)
                            .setIntegrationTypes(
                                model.integrations ?? [
                                    ApplicationIntegrationType.GuildInstall,
                                    ApplicationIntegrationType.UserInstall
                                ]
                            )
                            .setNameLocalizations(model.nameLocalizations!)
                            .setType(ApplicationCommandType.Message as ContextMenuCommandType);

                        commands.push(message);
                        break;
                }
                console.log(` | ${blue(model.name)} has been added to discord.`);
            }

            const rest = new REST({ version: '10' }).setToken(process.env.token);
            await rest.put(Routes.applicationCommands(this.self.djsClient.user!.id), { body: commands });
            console.log(`${green(this.runText)} | Slash commands are loaded.`);
        }
    }

    private async addOption(
        slash: CommandOptionsManagerResolvable | SlashCommandSubcommandGroupBuilder,
        option: CommandOptionsInterface
    ): Promise<ApplicationCommandOptionBase | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder> {
        const defaultCommand = (
            option_1: ApplicationCommandOptionBase | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder,
            option_2: CommandOptionsInterface
        ) => {
            option_1
                .setName(option_2.name)
                .setDescription(option_2.description ?? 'Pop! This option lost its description.')
                .setNameLocalizations(option_2.nameLocalizations!)
                .setDescriptionLocalizations(
                    option_2.descriptionLocalizations ?? {
                        fr: 'Pop ! Cette option a perdue sa description.'
                    }
                );
            return option_1;
        };

        let myOption: ApplicationCommandOptionBase | SlashCommandSubcommandBuilder | SlashCommandSubcommandGroupBuilder;
        switch (option.type) {
            case ApplicationCommandOptionType.Attachment:
                (slash as CommandOptionsManagerResolvable).addAttachmentOption(
                    (option_1: SlashCommandAttachmentOption): SlashCommandAttachmentOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Boolean:
                (slash as CommandOptionsManagerResolvable).addBooleanOption(
                    (option_1: SlashCommandBooleanOption): SlashCommandBooleanOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Channel:
                (slash as CommandOptionsManagerResolvable).addChannelOption(
                    (option_1: SlashCommandChannelOption): SlashCommandChannelOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        if (option.channelTypes && option.channelTypes.length > 0)
                            option_1.addChannelTypes(option.channelTypes);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Integer:
                (slash as CommandOptionsManagerResolvable).addIntegerOption(
                    (option_1: SlashCommandIntegerOption): SlashCommandIntegerOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        if (option.choices && option.choices.length > 0) option_1.addChoices(option.choices);
                        if (option.autocomplete) option_1.setAutocomplete(true);
                        if (option.maxValue) option_1.setMaxValue(option.maxValue);
                        if (option.minValue) option_1.setMinValue(option.minValue);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Mentionable:
                (slash as CommandOptionsManagerResolvable).addMentionableOption(
                    (option_1: SlashCommandMentionableOption): SlashCommandMentionableOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Number:
                (slash as CommandOptionsManagerResolvable).addNumberOption(
                    (option_1: SlashCommandNumberOption): SlashCommandNumberOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        if (option.choices && option.choices.length > 0) option_1.addChoices(option.choices);
                        if (option.autocomplete) option_1.setAutocomplete(true);
                        if (option.maxValue) option_1.setMaxValue(option.maxValue);
                        if (option.minValue) option_1.setMinValue(option.minValue);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.String:
                (slash as CommandOptionsManagerResolvable).addStringOption(
                    (option_1: SlashCommandStringOption): SlashCommandStringOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        if (option.choices && option.choices.length > 0) option_1.addChoices(option.choices);
                        if (option.autocomplete) option_1.setAutocomplete(true);
                        if (option.maxLength) option_1.setMaxLength(option.maxLength);
                        if (option.minLength) option_1.setMinLength(option.minLength);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.User:
                (slash as CommandOptionsManagerResolvable).addUserOption(
                    (option_1: SlashCommandUserOption): SlashCommandUserOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Role:
                (slash as CommandOptionsManagerResolvable).addBooleanOption(
                    (option_1: SlashCommandBooleanOption): SlashCommandBooleanOption => {
                        defaultCommand(option_1, option);
                        if (option.required) option_1.setRequired(option.required);
                        return (myOption = option_1);
                    }
                );
                break;
            case ApplicationCommandOptionType.Subcommand:
                (slash as SlashCommandBuilder | SlashCommandSubcommandGroupBuilder).addSubcommand(
                    (sub: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder => {
                        defaultCommand(sub, option);
                        if (option.options && option.options.length > 0)
                            for (const option_1 of option.options) this.addOption(sub, option_1);
                        return (myOption = sub);
                    }
                );
                break;
            case ApplicationCommandOptionType.SubcommandGroup:
                (slash as SlashCommandBuilder).addSubcommandGroup(
                    (sub: SlashCommandSubcommandGroupBuilder): SlashCommandSubcommandGroupBuilder => {
                        defaultCommand(sub, option);
                        if (option.options && option.options.length > 0)
                            for (const option_1 of option.options) this.addOption(sub, option_1);
                        return (myOption = sub);
                    }
                );
                break;
        }

        return myOption!;
    }

    public async deleteCommands(): Promise<void> {
        for (const command of this.commands.keys()) this.commands.delete(command);
        for (const command of this.self.djsClient.application?.commands.cache ?? []) {
            await command[1].delete();
            console.error(` | ${red(command[1].name)} has been removed from discord.`);
        }
    }

    public async deleteCommand(identifier: string): Promise<void> {
        const command: ApplicationCommand | undefined = this.self.djsClient.application?.commands.cache.find(
            (command: ApplicationCommand) => command.name === identifier || command.id === identifier
        );
        if (command) {
            await command.delete();
            console.error(` | ${red(command.name)} has been removed from discord.`);
        }
    }
}
