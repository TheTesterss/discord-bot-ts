import { EmbedBuilder, InteractionReplyOptions } from 'discord.js';
import { CommandColors } from '../../types/colors';
import Self from '../../classes/Self';
import Database from '../../modules/Database';
import { LangType, LangTypes } from '../../types/options';
import { GuildDocument } from '../../modules/models/Guild';
import { generateDeniedAccessFooter } from '../texts';

export const disallowClick = async (
    self: Self,
    db: Database,
    id: string,
    message: string
): Promise<InteractionReplyOptions & { fetchReply: true }> => {
    const d: GuildDocument | null = await db.models.GuildDB.findOne({ id });
    const lang: LangTypes = d?.lang ?? LangType.EN;
    const myEmbed = new EmbedBuilder().setColor(CommandColors.ERROR).setFooter(generateDeniedAccessFooter(self)[lang]);

    myEmbed.setDescription(`## ${message}`);

    return {
        fetchReply: true,
        ephemeral: true,
        embeds: [myEmbed]
    };
};
