import {
    ActivityType,
    ApplicationCommandOptionChoiceData,
    AutocompleteInteraction,
    MessageCreateOptions,
    TextChannel
} from 'discord.js';
import { CustomEvents_E, EventInterface, EventType } from '../../types/events';
import Self from '../../classes/Self';
import Database from '../../modules/Database';
import { LangTypes } from '../../types/options';
import * as fs from 'fs';
import { errorHandling } from '../../utils/embeds/errors';

export = {
    name: CustomEvents_E.AutocompleteExecution,
    type: EventType.CUSTOM,
    once: false,
    run: async (self: Self, db: Database, interaction: AutocompleteInteraction, lang: LangTypes): Promise<void> => {
        if (
            interaction.options.getSubcommandGroup() !== 'client' ||
            interaction.options.getSubcommand() !== 'activity' ||
            interaction.options.getString('function', true) === 'reset'
        )
            return;
        try {
            const values: { text: string; type: ActivityType; url?: string }[] = JSON.parse(
                fs.readFileSync('./src/utils/data/activities.json', 'utf-8')
            );
            const focused = interaction.options.getFocused(true);
            if (!focused || !focused.value) return void interaction.respond([]);
            const choices: ApplicationCommandOptionChoiceData[] = values
                .filter((value: { text: string; type: ActivityType; url?: string }) =>
                    value.text.toLowerCase().includes(focused.value.toLowerCase())
                )
                .map((value: { text: string; type: ActivityType; url?: string }) => {
                    return {
                        name: `${value.text} - ${ActivityType[value.type]} - ${value?.url ?? 'No url'}`,
                        name_localizations: {
                            fr: `${value.text} - ${ActivityType[value.type]} - ${value?.url ?? 'No url'}`
                        },
                        value: value.text
                    };
                })
                .slice(0, 25);
            interaction.respond(choices);
        } catch (e) {
            await (interaction.client.channels.cache.get(process.env.logchannel) as TextChannel).send(
                (await errorHandling(self, db, interaction.guildId ?? '0', e as Error)) as MessageCreateOptions
            );
        }
    }
} as EventInterface;
