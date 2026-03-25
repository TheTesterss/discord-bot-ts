import {
    AnySelectMenuInteraction,
    ApplicationCommandType,
    AutocompleteInteraction,
    ButtonInteraction,
    ChannelSelectMenuInteraction,
    ChatInputCommandInteraction,
    ComponentType,
    Events,
    Interaction,
    InteractionType,
    MentionableSelectMenuInteraction,
    MessageContextMenuCommandInteraction,
    ModalSubmitInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction,
    UserContextMenuCommandInteraction,
    UserSelectMenuInteraction
} from 'discord.js';
import { CustomEvents_E, EventInterface, EventType } from '../types/events';
import Self from '../classes/Self';
import Database from '../modules/Database';
import { GuildDocument } from '../modules/models/Guild';
import { LangType, LangTypes } from '../types/options';
import { CommandInterface } from '../types/commands';

export = {
    name: Events.InteractionCreate,
    type: EventType.CLASSIC,
    once: false,
    run: async (self: Self, db: Database, interaction: Interaction): Promise<void> => {
        const guild: GuildDocument | null = await db.models.GuildDB.findOne({ id: interaction.guild?.id });
        const lang: LangTypes = guild?.lang ?? LangType.EN;

        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
                const command: CommandInterface = self.commandManager.commands.get(interaction.commandName)!;
                if (!interaction.deferred)
                    await interaction.deferReply({ ephemeral: command.managedOptions?.ephemeralSending ?? false });
                switch (interaction.commandType) {
                    case ApplicationCommandType.ChatInput:
                        self.emit(
                            CustomEvents_E.SlashCommandExecution,
                            self,
                            db,
                            interaction as ChatInputCommandInteraction,
                            command,
                            lang
                        );
                        break;
                    case ApplicationCommandType.Message:
                        self.emit(
                            CustomEvents_E.MessageContextCommandExecution,
                            self,
                            db,
                            interaction as MessageContextMenuCommandInteraction,
                            command,
                            lang
                        );
                        break;
                    case ApplicationCommandType.User:
                        self.emit(
                            CustomEvents_E.UserContextCommandExecution,
                            self,
                            db,
                            interaction as UserContextMenuCommandInteraction,
                            command,
                            lang
                        );
                        break;
                }
            case InteractionType.ApplicationCommandAutocomplete:
                self.emit(CustomEvents_E.AutocompleteExecution, self, db, interaction as AutocompleteInteraction, lang);
                break;
            case InteractionType.ModalSubmit:
                self.emit(CustomEvents_E.ModalExecution, self, db, interaction as ModalSubmitInteraction, lang);
                break;
            case InteractionType.MessageComponent:
                if (interaction.componentType !== ComponentType.Button)
                    self.emit(
                        CustomEvents_E.AnySelectMenuExecution,
                        self,
                        db,
                        interaction as AnySelectMenuInteraction,
                        lang
                    );
                switch (interaction.componentType) {
                    case ComponentType.Button:
                        self.emit(CustomEvents_E.ButtonExecution, self, db, interaction as ButtonInteraction, lang);
                        break;
                    case ComponentType.ChannelSelect:
                        self.emit(
                            CustomEvents_E.ChannelSelectMenuExecution,
                            self,
                            db,
                            interaction as ChannelSelectMenuInteraction,
                            lang
                        );
                        break;
                    case ComponentType.MentionableSelect:
                        self.emit(
                            CustomEvents_E.MentionableSelectMenuoption,
                            self,
                            db,
                            interaction as MentionableSelectMenuInteraction,
                            lang
                        );
                        break;
                    case ComponentType.RoleSelect:
                        self.emit(
                            CustomEvents_E.RoleSelectMenuExecution,
                            db,
                            interaction as RoleSelectMenuInteraction,
                            lang
                        );
                        break;
                    case ComponentType.StringSelect:
                        self.emit(
                            CustomEvents_E.StringSelectMenuExecution,
                            self,
                            db,
                            interaction as StringSelectMenuInteraction,
                            lang
                        );
                        break;
                    case ComponentType.UserSelect:
                        self.emit(
                            CustomEvents_E.UserSelectMenuExecution,
                            self,
                            db,
                            interaction as UserSelectMenuInteraction,
                            lang
                        );
                        break;
                }
                break;
        }
    }
} as EventInterface;
