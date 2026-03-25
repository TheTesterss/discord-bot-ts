import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    InteractionReplyOptions,
    MessageCreateOptions,
    MessageActionRowComponentBuilder,
    MessagePayload,
    InteractionEditReplyOptions
} from 'discord.js';
import { CommandColors } from '../../types/colors';
import Self from '../../classes/Self';
import Database from '../../modules/Database';
import { LangType, LangTypes } from '../../types/options';
import { GuildDocument } from '../../modules/models/Guild';
import { generateInternalErrorFooter } from '../texts';

export const errorHandling = async (
    self: Self,
    db: Database,
    id: string,
    error: Error
): Promise<MessageCreateOptions | InteractionReplyOptions | MessagePayload | InteractionEditReplyOptions> => {
    const d: GuildDocument | null = await db.models.GuildDB.findOne({ id });
    const lang: LangTypes = d?.lang ?? LangType.EN;
    const myEmbed = new EmbedBuilder()
        .setColor(CommandColors.ERROR)
        .setFooter(generateInternalErrorFooter(self, error.name)[lang]);
    const myRow = new ActionRowBuilder<MessageActionRowComponentBuilder>();

    myEmbed
        .addFields({
            name: `📜 **${lang === 'fr' ? 'Chemins complets' : 'Full paths'}**`,
            value: `\`\`\`ts\n${(error.stack?.split('\n').slice(1).join('\n').split('').slice(0, 1015).join('') ?? lang === 'en') ? 'Untrackable' : 'Intracable'}\`\`\``,
            inline: false
        })
        .setDescription(`## ${error.message}`);
    myRow.addComponents(
        new ButtonBuilder()
            .setCustomId('error-explainations')
            .setDisabled(false)
            .setEmoji('🧧')
            .setLabel(lang === 'fr' ? 'Découvre mes erreurs !' : 'Discover my errors!')
            .setStyle(ButtonStyle.Danger)
    );

    return {
        embeds: [myEmbed],
        components: [myRow.toJSON()] as NonNullable<MessageCreateOptions['components']>
    };
};
