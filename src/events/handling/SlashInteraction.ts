import { ApplicationCommandType, ChatInputCommandInteraction } from 'discord.js';
import { CustomEvents_E, EventInterface, EventType } from '../../types/events';
import Self from '../../classes/Self';
import Database from '../../modules/Database';
import { CommandCustomOptionsInterface, CommandInterface } from '../../types/commands';
import { LangType, LangTypes } from '../../types/options';
import { errorHandling } from '../../utils/embeds/errors';

export = {
    name: CustomEvents_E.SlashCommandExecution,
    type: EventType.CUSTOM,
    once: false,
    run: async (
        self: Self,
        db: Database,
        interaction: ChatInputCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ): Promise<void> => {
        for (const option in command.customOptions ?? {}) {
            if (!command.customOptions![option as keyof CommandCustomOptionsInterface]) continue;
            const { unacceptanceFunction, verifyCondition } =
                self.preconditions[option as keyof CommandCustomOptionsInterface];
            if (!verifyCondition(self, db, interaction, lang))
                return void interaction.editReply(
                    await unacceptanceFunction(
                        self,
                        db,
                        interaction,
                        lang,
                        command.managedOptions?.ephemeralSending ?? false
                    )
                );
        }

        try {
            switch (lang) {
                case LangType.EN:
                    if (command.en) command.en(self, db, interaction, command, lang);
                    else throw new Error('No function put for english usage. Try out the french version.');
                    break;
                case LangType.FR:
                    if (command.fr) command.fr(self, db, interaction, command, lang);
                    else throw new Error('No function put for english usage. Try out the english version.');
                    break;
                default:
                    throw new Error('The lang has been wrongly configurated.');
            }
        } catch (e) {
            return void interaction.editReply(await errorHandling(self, db, interaction.guildId ?? '0', e as Error));
        }
    }
} as EventInterface;
