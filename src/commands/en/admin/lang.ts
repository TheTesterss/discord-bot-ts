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
    nameLocalizations: { fr: 'configuration' },
    integrations: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    types: [ApplicationCommandType.ChatInput],
    options: [
        {
            name: 'lang',
            nameLocalizations: { fr: 'langue' },
            description: 'Used to change the lang on the server.',
            descriptionLocalizations: {
                fr: 'Utilisé pour modifier la langue utilisée sur le serveur.'
            },
            type: ApplicationCommandOptionType.Subcommand,
            options: [
                {
                    name: 'lang',
                    nameLocalizations: { fr: 'langue' },
                    description: 'The new language.',
                    descriptionLocalizations: {
                        fr: 'Le nouveau langage.'
                    },
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    choices: [
                        {
                            name: 'English',
                            name_localizations: { fr: 'Anglais' },
                            value: LangType.EN
                        },
                        {
                            name: 'French',
                            name_localizations: { fr: 'Français' },
                            value: LangType.FR
                        }
                    ]
                }
            ]
        }
    ],
    managedOptions: {
        ephemeralSending: false,
        allowDms: false,
        isNSFW: false,
        clientRequiredPermissions: [
            PermissionFlagsBits.EmbedLinks,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
        ],
        userRequiredPermissions: [
            PermissionFlagsBits.Administrator,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
        ]
    },
    customOptions: {
        forGuildAdminsOnly: true,
        blacklistDisallowed: true
    },
    en: async (
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
                .setDescription(`## One of my property has been updated.`)
                .addFields({
                    name: '📜 Changements',
                    value: `\`\`\`ANSI\n${`OLD LANG: ${red(lang === 'en' ? 'English' : 'French')}\nNEW LANG: ${green(nlang === 'en' ? 'English' : 'French')}`}\`\`\``
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
