import { DatabaseEvents_E, EventInterface, EventType } from '../../types/events';
import Self from '../../classes/Self';
import Database from '../../modules/Database';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandColors } from '../../types/colors';
import { generateSuccessFooter } from '../../utils/texts';
import { LangType } from '../../types/options';
import { green, yellow } from '../../modules/Colors';
export = {
    name: DatabaseEvents_E.OnBlacklistAdd,
    type: EventType.DATABASE,
    once: true,
    run: async (self: Self, db: Database, id: string): Promise<void> => {
        const lang = LangType.EN;
        const user = await db.models.UserDB.findOne({ id });
        if (!user) return;
        return void (await (self.djsClient.channels.cache.get(process.env.dblogchannel) as TextChannel).send({
            embeds: [
                new EmbedBuilder()
                    .setColor(CommandColors.SUCCESS)
                    .setFooter(generateSuccessFooter(self)[lang])
                    .setDescription(`## An user has been added into the blacklist.`)
                    .addFields({
                        name: `📜 user infos`,
                        value: `\`\`\`ANSI\n${`USER: ${green(user.username)}\nBY: ${green(user.blacklist?.by ?? 'Not found')}\nFOR: ${yellow(user.blacklist?.reason ?? 'No reason provided.')}`}\`\`\``
                    })
            ]
        }));
    }
} as EventInterface;
