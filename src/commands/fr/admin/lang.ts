import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    EmbedBuilder,
    MessageCreateOptions,
    PermissionFlagsBits,
    TextChannel
} from 'discord.js';
import { CommandInterface } from '../../../types/commands';
import Self from '../../../classes/Self';
import Database from '../../../modules/Database';
import { LangType, LangTypes } from '../../../types/options';
import { CommandColors } from '../../../types/colors';
import { generateSuccessFooter } from '../../../utils/texts';
import { red, green } from '../../../modules/Colors';
import { errorHandling } from '../../../utils/embeds/errors';

export = {
    name: 'configuration',
    fr: async (
        self: Self,
        db: Database,
        interaction: ChatInputCommandInteraction,
        command: CommandInterface,
        lang: LangTypes
    ) => {
        const sub = interaction.options.getSubcommand();
        if (sub === 'lang') {
            const nlang = interaction.options.getString('lang', true);
            const myEmbed = new EmbedBuilder()
                .setColor(CommandColors.SUCCESS)
                .setFooter(generateSuccessFooter(self)[lang])
                .setDescription(`## Une de mes caractéristiques a été modifié.`)
                .addFields({
                    name: '📜 Changements',
                    value: `\`\`\`ANSI\n${`ANCIENNE LANGUE: ${red(lang === 'en' ? 'Anglais' : 'Français')}\nNOUVELLE LANGUE: ${green(nlang === 'en' ? 'Anglais' : 'Français')}`}\`\`\``
                });

            try {
                await db.models.GuildDB.findOneAndUpdate({ id: interaction.guildId ?? '0' }, { lang: nlang });
            } catch (e) {
                return void (await (interaction.client.channels.cache.get(process.env.logchannel) as TextChannel)?.send(
                    (await errorHandling(self, db, interaction.guildId ?? '0', e as Error)) as MessageCreateOptions
                ));
            }
            return void interaction.editReply({ embeds: [myEmbed] });
        }
    }
} as CommandInterface;
