import {
    ActionRowBuilder,
    ActivityType,
    ApplicationCommandOptionType,
    ApplicationCommandType,
    ApplicationIntegrationType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ComponentType,
    EmbedBuilder,
    InteractionEditReplyOptions,
    MessageActionRowComponentBuilder,
    MessageCreateOptions,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    StringSelectMenuOptionBuilder,
    TextChannel,
    User,
    UserSelectMenuBuilder,
    UserSelectMenuInteraction,
} from 'discord.js';
import { CommandInterface, InteractionsResolvable } from '../../../types/commands';
import Self from '../../../classes/Self';
import Database from '../../../modules/Database';
import { LangType, LangTypes } from '../../../types/options';
import { UserDocument } from '../../../modules/models/User';
import { CommandColors } from '../../../types/colors';
import { generateSuccessFooter } from '../../../utils/texts';
import { blue, green, red, yellow } from '../../../modules/Colors';
import disableAllComponents from '../../../utils/components/disableAllComponents';
import { disallowClick } from '../../../utils/embeds/user';
import { errorHandling } from '../../../utils/embeds/errors';
import * as fs from 'fs';
import { DatabaseEvents_E } from '../../../types/events';

type ActionType = {
    user: User;
    target: User;
    actionString: string;
};

export = {
    name: 'managers',
    nameLocalizations: { fr: 'gestionnaires' },
    integrations: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
    types: [ApplicationCommandType.ChatInput],
    options: [
        {
            name: 'list',
            nameLocalizations: { fr: 'liste' },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'white',
                    nameLocalizations: { fr: 'blanche' },
                    description: 'Used to manage the whitelisted users.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour gérer les utilisateurs sous liste blanche.'
                    },
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: 'black',
                    nameLocalizations: { fr: 'noire' },
                    description: 'Used to manage the blacklisted users.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour gérer les utilisateurs sous liste noire.'
                    },
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        },
        {
            name: 'client',
            nameLocalizations: { fr: 'client' },
            description: 'Used to manage my profile.',
            descriptionLocalizations: {
                fr: 'Utilisé pour gérer mon profil.'
            },
            type: ApplicationCommandOptionType.SubcommandGroup,
            options: [
                {
                    name: 'username',
                    nameLocalizations: { fr: 'nom' },
                    description: 'Used to change my username.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour changer mon nom.'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'name',
                            nameLocalizations: { fr: 'nom' },
                            description: 'The new username.',
                            descriptionLocalizations: {
                                fr: 'Le nouveau nom.'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            maxLength: 32
                        }
                    ]
                },
                {
                    name: 'avatar',
                    nameLocalizations: { fr: 'avatar' },
                    description: 'Used to change my avatar.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour changer mon avatar.'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'file',
                            nameLocalizations: { fr: 'fichier' },
                            description: 'The new avatar file.',
                            descriptionLocalizations: {
                                fr: 'Le fichier du nouvel avatar.'
                            },
                            type: ApplicationCommandOptionType.Attachment,
                            required: true
                        }
                    ]
                },
                {
                    name: 'activity',
                    nameLocalizations: { fr: 'activité' },
                    description: 'Used to change my status.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour changer mon statut.'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'function',
                            nameLocalizations: { fr: 'fonction' },
                            description: "What you want to do with client's activities.",
                            descriptionLocalizations: {
                                fr: 'Que souhaites tu faire avec les activitités du client.'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: 'Add',
                                    name_localizations: {
                                        fr: 'Ajouter'
                                    },
                                    value: 'add'
                                },
                                {
                                    name: 'Remove',
                                    name_localizations: {
                                        fr: 'Retirer'
                                    },
                                    value: 'remove'
                                },
                                {
                                    name: 'Reset',
                                    name_localizations: {
                                        fr: 'Réinitialiser'
                                    },
                                    value: 'reset'
                                }
                            ]
                        },
                        {
                            name: 'text',
                            nameLocalizations: { fr: 'texte' },
                            description: 'The new status content.',
                            descriptionLocalizations: {
                                fr: 'Le nouveau contenu du statut.'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            maxLength: 128,
                            autocomplete: true
                        },
                        {
                            name: 'type',
                            nameLocalizations: { fr: 'type' },
                            description: 'The new status type.',
                            descriptionLocalizations: {
                                fr: 'Le nouveau type de statut.'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: false,
                            choices: [
                                {
                                    name: 'Playing',
                                    name_localizations: {
                                        fr: 'Joue'
                                    },
                                    value: 'Playing'
                                },
                                {
                                    name: 'Listening',
                                    name_localizations: {
                                        fr: 'Écoute'
                                    },
                                    value: 'Listening'
                                },
                                {
                                    name: 'Watching',
                                    name_localizations: {
                                        fr: 'Regarde'
                                    },
                                    value: 'Watching'
                                },
                                {
                                    name: 'Streaming',
                                    name_localizations: {
                                        fr: 'Diffuse'
                                    },
                                    value: 'Streaming'
                                },
                                {
                                    name: 'Competing',
                                    name_localizations: {
                                        fr: 'Compétitionne'
                                    },
                                    value: 'Competing'
                                }
                            ]
                        },
                        {
                            name: 'url',
                            nameLocalizations: { fr: 'url' },
                            description: 'The new streaming url.',
                            descriptionLocalizations: {
                                fr: "L'url de la nouvelle diffusion."
                            },
                            type: ApplicationCommandOptionType.String,
                            required: false
                        }
                    ]
                },
                {
                    name: 'status',
                    nameLocalizations: { fr: 'statut' },
                    description: 'Used to change my status.',
                    descriptionLocalizations: {
                        fr: 'Utilisé pour changer mon statut.'
                    },
                    type: ApplicationCommandOptionType.Subcommand,
                    options: [
                        {
                            name: 'status',
                            nameLocalizations: { fr: 'statut' },
                            description: 'The new status.',
                            descriptionLocalizations: {
                                fr: 'Le nouveau statut.'
                            },
                            type: ApplicationCommandOptionType.String,
                            required: true,
                            choices: [
                                {
                                    name: 'Online',
                                    nameLocalizations: {
                                        fr: 'En ligne'
                                    },
                                    value: 'online'
                                },
                                {
                                    name: 'Idle',
                                    nameLocalizations: {
                                        fr: 'Inactif'
                                    },
                                    value: 'idle'
                                },
                                {
                                    name: 'Do Not Disturb',
                                    nameLocalizations: {
                                        fr: 'Ne pas déranger'
                                    },
                                    value: 'dnd'
                                },
                                {
                                    name: 'Invisible',
                                    nameLocalizations: {
                                        fr: 'Invisible'
                                    },
                                    value: 'invisible'
                                }
                            ]
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
        forBotOwnerOnly: true,
        blacklistDisallowed: true
    },
    en: async (
        self: Self,
        db: Database,
        interaction: InteractionsResolvable,
        command: CommandInterface,
        lang: LangTypes
    ): Promise<void> => {
        interaction = interaction as ChatInputCommandInteraction;

        const group = interaction.options.getSubcommandGroup();
        const fullCommand = group
            ? `${group} ${interaction.options.getSubcommand()}`
            : interaction.options.getSubcommand();
        const sub = interaction.options.getSubcommand();

        let start = 0;
        let end = 5;

        let action: ActionType;

        const generateListButtons = (
            type: string,
            usersList: Array<UserDocument> = [],
            start: number,
            end: number
        ): Array<StringSelectMenuBuilder[] | ButtonBuilder[]> => {
            const usersMenu: StringSelectMenuOptionBuilder[] = usersList
                .slice(start, end)
                .map((user: UserDocument, index: number) => {
                    return new StringSelectMenuOptionBuilder()
                        .setDefault(false)
                        .setLabel(user.username)
                        .setDescription(
                            `USER #${index + 1 + start} | BLACKLISTED FOR: ${user.blacklist!.reason?.split('').slice(0, 73).join('') ?? 'No reason provided.'}`
                        )
                        .setValue(user.id.padEnd(10, '0'))
                        .setEmoji('*️⃣');
                });

            const menu = [
                new StringSelectMenuBuilder()
                    .setCustomId(`managers-${type}-menu`)
                    .setDisabled(false)
                    .setMaxValues(usersMenu.length === 0 ? 1 : usersMenu.length)
                    .setMinValues(1)
                    .setPlaceholder('Select the users to be removed from the list.')
                    .addOptions(
                        usersList.length === 0
                            ? [
                                  new StringSelectMenuOptionBuilder()
                                      .setDefault(true)
                                      .setLabel('List empty')
                                      .setDescription('it seems like this list is empty for now.')
                                      .setValue(`managers-${type}-empty`)
                                      .setEmoji('💡')
                              ]
                            : usersMenu
                    )
            ];
            const buttons = [
                new ButtonBuilder()
                    .setCustomId(`managers-${type}-lefta`)
                    .setDisabled(start === 0)
                    .setEmoji('⏪')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`managers-${type}-left`)
                    .setDisabled(start === 0)
                    .setEmoji('◀️')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`managers-${type}-add`)
                    .setDisabled(false)
                    .setEmoji('➕')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`managers-${type}-right`)
                    .setDisabled(usersList.length <= end)
                    .setEmoji('▶️')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`managers-${type}-righta`)
                    .setDisabled(usersList.length <= end)
                    .setEmoji('⏩')
                    .setStyle(ButtonStyle.Success)
            ];

            return [menu, buttons];
        };

        const generateListEmbed = (
            type: string,
            records: UserDocument[],
            start: number,
            end: number,
            embed: EmbedBuilder
        ): EmbedBuilder => {
            const userList = records
                .slice(start, end)
                .map((user: UserDocument) => {
                    return `USER: ${green(user.username)}\nAT: ${blue(
                        (
                            user.whitelist?.dates?.from?.toLocaleDateString('en-US', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }) ?? 'Not found'
                        ).replace(/ /g, ' ')
                    )}\nBY: ${yellow(`${self.djsClient.users.cache.get(user.whitelist?.by!)?.username ?? 'Not found'} `)}`;
                })
                .join(`\n${'-'.repeat(32)}\n`);

            return embed
                .setColor(CommandColors.SUCCESS)
                .setFooter(generateSuccessFooter(self)[lang])
                .setDescription(`## ${type}-listed users ; ${records.length} records.`)
                .addFields({
                    name: `📜 ${records.length > 9 ? 10 : records.length} records | ${start}/${end} at page ${start / 10 + 1}/${Math.floor(records.length / 10) + 1}`,
                    value: `\`\`\`ANSI\n${
                        records.length === 0 ? green(`There is no user in the ${type} list.`) : userList
                    }\`\`\``,
                    inline: false
                });
        };

        let myEmbed = new EmbedBuilder();
        let myForgottenEmbed = new EmbedBuilder()
            .setColor(CommandColors.SUCCESS)
            .setFooter(generateSuccessFooter(self)[lang])
            .setDescription(`## One of my property has been updated.`);
        let myRow1 = new ActionRowBuilder<MessageActionRowComponentBuilder>();
        let myRow2 = new ActionRowBuilder<MessageActionRowComponentBuilder>();

        let records: UserDocument[] = [];
        if (sub === 'white') records = await db.fetchUsers((user: UserDocument) => user.whitelist?.isWhitelisted);
        if (sub === 'black') {
            records = await db.fetchUsers((user: UserDocument) => user.blacklist?.isBlacklisted);
        }

        try {
            switch (fullCommand) {
                case 'list white':
                    myEmbed = generateListEmbed(sub, records, start, end, myEmbed);
                    const components_w = generateListButtons(sub, records, start, end);
                    myRow1.addComponents(components_w[0]);
                    myRow2.addComponents(components_w[1]);
                    break;
                case 'list black':
                    myEmbed = generateListEmbed(sub, records, start, end, myEmbed);
                    const components_b = generateListButtons(sub, records, start, end);
                    myRow1.addComponents(components_b[0]);
                    myRow2.addComponents(components_b[1]);
                    break;
                case 'client username':
                    const name = interaction.options.getString('name', true);
                    myForgottenEmbed.addFields({
                        name: '📜 Changements',
                        value: `\`\`\`ANSI\n${`OLD USERNAME: ${red(self.djsClient.user?.username ?? 'Unknown')}\nNEW USERNAME: ${green(name)}`}\`\`\``
                    });
                    await self.djsClient.user?.setUsername(name);
                    myEmbed = myForgottenEmbed;
                    break;
                case 'client avatar':
                    const avatar = interaction.options.getAttachment('file', true);
                    myForgottenEmbed
                        .addFields({
                            name: '📜 Changements',
                            value: `\`\`\`ANSI\n${`OLD AVATAR: ${red(self.djsClient.user?.avatarURL({ extension: 'png', size: 2048, forceStatic: true }) ?? 'Not found')})\nNEW AVATAR: ${green(avatar.url)}`}\`\`\``
                        })
                        .setImage(avatar.url);
                    await self.djsClient.user?.setAvatar(avatar.url);
                    myEmbed = myForgottenEmbed;
                    break;
                case 'client status':
                    const status = interaction.options.getString('status', true);
                    myForgottenEmbed.addFields({
                        name: '📜 Changements',
                        value: `\`\`\`ANSI\n${`OLD STATUS: ${red(self.djsClient.user?.presence.status ?? 'online')}\nNEW STATUS: ${green(status)}`}\`\`\``
                    });
                    self.djsClient.user?.setStatus(status as 'online' | 'idle' | 'dnd' | 'invisible');
                    myEmbed = myForgottenEmbed;
                    break;
                case 'client activity':
                    const func = interaction.options.getString('function', true) as 'add' | 'remove' | 'reset';
                    let activities = JSON.parse(fs.readFileSync('./src/utils/data/activities.json', 'utf-8'));
                    const text = interaction.options.getString('text', false);
                    const type =
                        ActivityType[
                            interaction.options.getString('type', false) as unknown as keyof typeof ActivityType
                        ];
                    const url = interaction.options.getString('url', false) ?? undefined;
                    switch (func) {
                        case 'add':
                            if (!text || !type)
                                throw new Error('You tried to add an activity without providing the text or the type.');
                            activities.push({ text, type, url });
                            myForgottenEmbed.addFields({
                                name: '📜 Changements',
                                value: `\`\`\`ANSI\n${`ADDED ACTIVITY: ${green(text)}\nTYPE: ${yellow(ActivityType[type] ?? 'Not found')}\nURL: ${blue(url ?? 'Not provided')}`}\`\`\``
                            });
                            break;
                        case 'remove':
                            let myActivity: { text: string; type: ActivityType; url: string } | undefined;
                            let myActivities = activities;
                            if (!text) throw new Error('You tried to remove an activity without providing the text.');
                            if (type)
                                myActivities = activities.filter(
                                    (activity: { text: string; type: ActivityType; url: string }) =>
                                        activity.type === type
                                );
                            myActivities = myActivities.filter(
                                (activity: { text: string; type: ActivityType; url: string }) => activity.text === text
                            );
                            myActivity = myActivities[0];
                            if (!myActivity) throw new Error('No activity matched with your requirement.');
                            activities = activities.filter(
                                (activity: { text: string; type: ActivityType; url: string }) => activity !== myActivity
                            );
                            myForgottenEmbed.addFields({
                                name: '📜 Changements',
                                value: `\`\`\`ANSI\n${`REMOVED ACTIVITY: ${green(myActivity.text)}\nTYPE: ${yellow(ActivityType[myActivity.type] ?? 'Not found')}\nURL: ${blue(url ?? 'Not provided')}`}\`\`\``
                            });
                            break;
                        case 'reset':
                            activities = [];
                            myForgottenEmbed.addFields({
                                name: '📜 Changements',
                                value: `\`\`\`ANSI\n${`RESETED ALL THE ACTIVITIES`}\`\`\``
                            });
                            break;
                    }
                    myEmbed = myForgottenEmbed;
                    fs.writeFileSync('./src/utils/data/activities.json', JSON.stringify(activities, null, 4), 'utf-8');
                    break;
                default:
                    throw new Error('I could not load this command.');
            }
        } catch (e) {
            const result = (await errorHandling(
                self,
                db,
                interaction.guildId ?? '0',
                e as Error
            )) as InteractionEditReplyOptions;
            myEmbed = result.embeds![0] as EmbedBuilder;
            myRow1 = result.components![0] as ActionRowBuilder<MessageActionRowComponentBuilder>;
        }

        const rows: Array<NonNullable<InteractionEditReplyOptions['components']>[number]> = [];
        if (myRow1.components.length > 0)
            rows.push(myRow1.toJSON() as NonNullable<InteractionEditReplyOptions['components']>[number]);
        if (myRow2.components.length > 0)
            rows.push(myRow2.toJSON() as NonNullable<InteractionEditReplyOptions['components']>[number]);

        const message = await interaction.editReply({
            embeds: [myEmbed],
            components: rows
        });

        const collector = message.createMessageComponentCollector({ time: 600_000 });
        collector
            .on('collect', async (i: StringSelectMenuInteraction | ButtonInteraction | UserSelectMenuInteraction) => {
                if (interaction.user.id !== i.user.id) {
                    if (!i.guild?.id) return;
                    return void i.reply(
                        await disallowClick(
                            self,
                            db,
                            i.guild.id,
                            "You can't interact with this component as it is not yours."
                        )
                    );
                }

                if (i.isUserSelectMenu() || i.isStringSelectMenu()) {
                    i = i as UserSelectMenuInteraction | StringSelectMenuInteraction;
                    await i.deferUpdate();
                    const result: boolean = i.componentType === ComponentType.UserSelect;
                    for (const value of i.values) {
                        if (value === i.client.user.id) return;
                        let user: UserDocument | null = await db.models.UserDB.findOne({ id: value });
                        if (user) {
                            if (sub === 'black') {
                                user.blacklist = {
                                    isBlacklisted: result,
                                    by: result ? i.user.id : undefined,
                                    reason: result ? 'No reason provided.' : undefined,
                                    dates: {
                                        from: result ? new Date() : undefined,
                                        to: result ? undefined : undefined
                                    },
                                    warns: result ? [] : [],
                                    evidences: result ? [] : []
                                };
                            }
                            if (sub === 'white') {
                                user.whitelist = {
                                    isWhitelisted: result,
                                    by: result ? i.user.id : undefined,
                                    dates: {
                                        from: result ? new Date() : undefined
                                    }
                                };
                            }
                            await user.save();
                        } else {
                            let blacklist: UserDocument['blacklist'];
                            if (sub === 'black') {
                                blacklist = {
                                    isBlacklisted: true,
                                    by: i.user.id,
                                    reason: 'No reason provided.',
                                    dates: {
                                        from: new Date(),
                                        to: undefined
                                    },
                                    warns: [],
                                    evidences: []
                                };
                            } else {
                                blacklist = {
                                    isBlacklisted: false,
                                    by: undefined,
                                    reason: undefined,
                                    dates: {
                                        from: undefined,
                                        to: undefined
                                    },
                                    warns: [],
                                    evidences: []
                                };
                            }
                            let whitelist: UserDocument['whitelist'];
                            if (sub === 'white') {
                                whitelist = {
                                    isWhitelisted: true,
                                    by: i.user.id,
                                    dates: {
                                        from: new Date()
                                    }
                                };
                            } else {
                                whitelist = {
                                    isWhitelisted: false,
                                    by: undefined,
                                    dates: {
                                        from: undefined
                                    }
                                };
                            }
                            user = await db.models.UserDB.create({
                                id: value,
                                username: i.client.users.cache.get(value)?.username,
                                blacklist,
                                whitelist
                            });
                        }

                        if(sub === "white")
                            db.emit(
                                result ? DatabaseEvents_E.OnWhitelistAdd : DatabaseEvents_E.OnWhitelistRemove,
                                self,
                                db,
                                value
                            );
                        else db.emit(
                            result ? DatabaseEvents_E.OnBlacklistAdd : DatabaseEvents_E.OnBlacklistRemove,
                            self,
                            db,
                            value
                        );

                        // ? Sends a private message to the blacklisted/whitelisted/unblacklisted/unwhitelisted user.
                        try {
                            // TODO: Add every properties such as evidences, reason, isTemp...
                            i.client.users.cache.get(value)?.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(CommandColors.SUCCESS)
                                        .setFooter(generateSuccessFooter(self)[lang])
                                        .setDescription(
                                            `## You have been ${i.isStringSelectMenu() ? 'un' : ''}${sub}listed by <@${i.user.id}>.`
                                        )
                                ]
                            });
                        } catch (e) {
                            await (interaction.client.channels.cache.get(process.env.logchannel) as TextChannel).send(
                                (await errorHandling(self, db, i.guild?.id ?? '0', e as Error)) as MessageCreateOptions
                            );
                        }
                    }

                    action = {
                        user: i.user,
                        target: i.client.users.cache.get(i.values[0])!,
                        actionString: result
                            ? `${i.user.username} just added ${i.client.users.cache.get(i.values[0])!.username} and ${i.values.length} others to the list.`
                            : `${i.user.username} just removed ${i.client.users.cache.get(i.values[0])!.username} and ${i.values.length} others from the list.`
                    };
                    const { user: executor, target, actionString: reason } = action;

                    const myUpdatedEmbed = new EmbedBuilder()
                        .setColor(CommandColors.SUCCESS)
                        .setFooter(generateSuccessFooter(self)[lang])
                        .setDescription(`## You're on the way to add/remove people to this list.`)
                        .addFields({
                            name: `📜 Last added user`,
                            value: `\`\`\`ANSI\n${
                                action
                                    ? `USER: ${green(target!.username)}\nBY: ${green(executor!.username)}\nFOR: ${yellow(reason!)}`
                                    : green(`There is no user in the ${sub} list.`)
                            }\`\`\``
                        });
                    const myUpdatedRow1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        new UserSelectMenuBuilder()
                            .setCustomId(`managers-${sub}-user`)
                            .setDisabled(false)
                            .setMaxValues(25)
                            .setMinValues(1)
                            .setPlaceholder('Select the users to be added to the list.')
                            .setDefaultUsers([])
                    );
                    const myUpdatedRow2 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`managers-${sub}-back`)
                            .setDisabled(false)
                            .setEmoji('◀️')
                            .setStyle(ButtonStyle.Success)
                    );

                    await message.edit({
                        embeds: [myUpdatedEmbed],
                        components: [
                            myUpdatedRow1.toJSON(),
                            myUpdatedRow2.toJSON()
                        ] as NonNullable<InteractionEditReplyOptions['components']>
                    });
                }

                // TODO: Add case with possibility of adding evidences (screenshots for selected users, show the warns of one selected user, add a reason and time for temp blacklist).
                if (i.isButton()) {
                    i = i as ButtonInteraction;
                    await i.deferUpdate();
                    const ids = i.customId.split('-');
                    switch (ids[2]) {
                        case 'lefta':
                            start = 0;
                            end = 5;
                            break;
                        case 'righta':
                            start = Math.floor(records.length / 10) * 10;
                            end = records.length;
                            break;
                        case 'left':
                            start -= 5;
                            end -= 5;
                            break;
                        case 'right':
                            start += 5;
                            end += 5;
                            break;
                        case 'add':
                            let executor: User | null = null;
                            let target: User | null = null;
                            let reason: string | null = null;
                            if (action) {
                                action = action as ActionType;
                                const { user, target: target_1, actionString } = action;
                                target = target_1;
                                executor = user;
                                reason = actionString;
                            }
                            const myUpdatedEmbed = new EmbedBuilder()
                                .setColor(CommandColors.SUCCESS)
                                .setFooter(generateSuccessFooter(self)[lang])
                                .setDescription(`## You're on the way to add people to this list.`)
                                .addFields({
                                    name: `📜 Last added user`,
                                    value: `\`\`\`ANSI\n${
                                        action
                                            ? `USER: ${green(target!.username)}\nBY: ${green(executor!.username)}\nFOR: ${yellow(reason!)}`
                                            : green(`There is no user in the ${sub} list.`)
                                    }\`\`\``
                                });
                            const myUpdatedRow1 =
                                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                    new UserSelectMenuBuilder()
                                        .setCustomId(`managers-${sub}-user`)
                                        .setDisabled(false)
                                        .setMaxValues(25)
                                        .setMinValues(1)
                                        .setPlaceholder('Select the users to be added to the list.')
                                        .setDefaultUsers([])
                                );
                            const myUpdatedRow2 =
                                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                    new ButtonBuilder()
                                        .setCustomId(`managers-${sub}-back`)
                                        .setDisabled(false)
                                        .setEmoji('◀️')
                                        .setStyle(ButtonStyle.Success)
                                );

                            await message.edit({
                                embeds: [myUpdatedEmbed],
                                components: [
                                    myUpdatedRow1.toJSON(),
                                    myUpdatedRow2.toJSON()
                                ] as NonNullable<InteractionEditReplyOptions['components']>
                            });
                            break;
                        case 'back':
                            // ? Already handled below.
                            break;
                    }

                    if (['righta', 'right', 'left', 'lefta', 'back'].includes(ids[2])) {
                        if (sub === 'white')
                            records = await db.fetchUsers((user: UserDocument) => user.whitelist?.isWhitelisted);
                        if (sub === 'black') {
                            records = await db.fetchUsers((user: UserDocument) => user.blacklist?.isBlacklisted);
                        }
                        const components = generateListButtons(sub, records, start, end);
                        await message.edit({
                            embeds: [generateListEmbed(sub, records, start, end, new EmbedBuilder())],
                            components: [
                                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                                    .addComponents(components[0])
                                    .toJSON(),
                                new ActionRowBuilder<MessageActionRowComponentBuilder>()
                                    .addComponents(components[1])
                                    .toJSON()
                            ] as NonNullable<InteractionEditReplyOptions['components']>
                        });
                    }
                }
            })
            .on('end', async () => {
                await message.edit({ components: disableAllComponents(message) });
            });
    }
} as CommandInterface;
