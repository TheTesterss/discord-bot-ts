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
    fr: async (
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
                            `UTILISATEUR #${index + 1 + start} | LISTE NOIRE POUR: ${user.blacklist!.reason?.split('').slice(0, 50).join('') ?? 'No reason provided.'}`
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
                    .setPlaceholder('Sélectionnes les utilisateurs à retirer de la liste.')
                    .addOptions(
                        usersList.length === 0
                            ? [
                                  new StringSelectMenuOptionBuilder()
                                      .setDefault(true)
                                      .setLabel('Liste vide')
                                      .setDescription("Il semble que cette liste soit vide pour l'instant.")
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
                    return `UTILISATEUR: ${green(user.username)}\nPAR: ${blue(
                        (
                            user.whitelist?.dates?.from?.toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            }) ?? 'Introuvable'
                        ).replace(/ /g, ' ')
                    )}\nPAR: ${yellow(`${self.djsClient.users.cache.get(user.whitelist?.by!)?.username ?? 'Introuvable'} `)}`;
                })
                .join(`\n${'-'.repeat(32)}\n`);

            return embed
                .setColor(CommandColors.SUCCESS)
                .setFooter(generateSuccessFooter(self)[lang])
                .setDescription(
                    `## utilisateurs listé ${type === 'white' ? 'blanc' : 'noir'} ; ${records.length} enregistrements.`
                )
                .addFields({
                    name: `📜 ${records.length > 9 ? 10 : records.length} enregistrements | ${start}/${end} à la page ${start / 10 + 1}/${Math.floor(records.length / 10) + 1}`,
                    value: `\`\`\`ANSI\n${
                        records.length === 0
                            ? green(`pas d'utilisateur dans la liste ${sub === 'white' ? 'blanche' : 'noire'}.`)
                            : userList
                    }\`\`\``,
                    inline: false
                });
        };

        let myEmbed = new EmbedBuilder();
        let myForgottenEmbed = new EmbedBuilder()
            .setColor(CommandColors.SUCCESS)
            .setFooter(generateSuccessFooter(self)[lang])
            .setDescription(`## Une de mes caractéristiques a été modifié.`);
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
                        value: `\`\`\`ANSI\n${`ANCIEN PSEUDONYME: ${red(self.djsClient.user?.username ?? 'Unknown')}\nNOUVEU PSEUDONYME: ${green(name)}`}\`\`\``
                    });
                    await self.djsClient.user?.setUsername(name);
                    myEmbed = myForgottenEmbed;
                    break;
                case 'client avatar':
                    const avatar = interaction.options.getAttachment('file', true);
                    myForgottenEmbed
                        .addFields({
                            name: '📜 Changements',
                            value: `\`\`\`ANSI\n${`ANCIEN AVATAR: ${red(self.djsClient.user?.avatarURL({ extension: 'png', size: 2048, forceStatic: true }) ?? 'Not found')})\nNOUVEL AVATAR: ${green(avatar.url)}`}\`\`\``
                        })
                        .setImage(avatar.url);
                    await self.djsClient.user?.setAvatar(avatar.url);
                    myEmbed = myForgottenEmbed;
                    break;
                case 'client status':
                    const status = interaction.options.getString('status', true);
                    myForgottenEmbed.addFields({
                        name: '📜 Changements',
                        value: `\`\`\`ANSI\n${`ANCIEN STATUT: ${red(self.djsClient.user?.presence.status ?? 'online')}\nNOUVEAU STATUT: ${green(status)}`}\`\`\``
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
                                value: `\`\`\`ANSI\n${`ACTIVITE AJOUTE: ${green(text)}\nTYPE: ${yellow(ActivityType[type] ?? 'Introuvable')}\nURL: ${blue(url ?? 'Pas donnée')}`}\`\`\``
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
                                value: `\`\`\`ANSI\n${`ACTIVITE RETIRE: ${green(myActivity.text)}\nTYPE: ${yellow(ActivityType[myActivity.type] ?? 'Introuvable')}\nURL: ${blue(url ?? 'Pas donnée')}`}\`\`\``
                            });
                            break;
                        case 'reset':
                            activities = [];
                            myForgottenEmbed.addFields({
                                name: '📜 Changements',
                                value: `\`\`\`ANSI\n${`REINITIALISE TOUTES LES ACTIVITES`}\`\`\``
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
                            "Vous ne pouvez pas intéragir avec puisqu'il n'est pas de vous."
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
                                    reason: result ? 'Aucune raison donnée.' : undefined,
                                    dates: {
                                        from: result ? new Date() : undefined,
                                        to: result ? undefined : undefined
                                    },
                                    warns: result ? [] : [],
                                    evidences: result ? [] : []
                                };
                                db.emit(
                                    result ? DatabaseEvents_E.OnBlacklistAdd : DatabaseEvents_E.OnBlacklistRemove,
                                    self,
                                    db,
                                    value
                                );
                            }
                            if (sub === 'white') {
                                user.whitelist = {
                                    isWhitelisted: result,
                                    by: result ? i.user.id : undefined,
                                    dates: {
                                        from: result ? new Date() : undefined
                                    }
                                };
                                db.emit(
                                    result ? DatabaseEvents_E.OnWhitelistAdd : DatabaseEvents_E.OnWhitelistRemove,
                                    self,
                                    db,
                                    value
                                );
                            }
                            await user.save();
                        } else {
                            let blacklist: UserDocument['blacklist'];
                            if (sub === 'black') {
                                blacklist = {
                                    isBlacklisted: true,
                                    by: i.user.id,
                                    reason: 'Aucune raison donnée.',
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

                        // ? Sends a private message to the blacklisted/whitelisted/unblacklisted/unwhitelisted user.
                        try {
                            // TODO: Add every properties such as evidences, reason, isTemp...
                            i.client.users.cache.get(value)?.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor(CommandColors.SUCCESS)
                                        .setFooter(generateSuccessFooter(self)[lang])
                                        .setDescription(
                                            `## Vous avez été ${i.isStringSelectMenu() ? 'un' : ''}${sub}listed par <@${i.user.id}>.`
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
                            ? `${i.user.username} a ajouté ${i.client.users.cache.get(i.values[0])!.username} et ${i.values.length} autres de la liste.`
                            : `${i.user.username} a retiré ${i.client.users.cache.get(i.values[0])!.username} et ${i.values.length} autres de la liste.`
                    };
                    const { user: executor, target, actionString: reason } = action;

                    const myUpdatedEmbed = new EmbedBuilder()
                        .setColor(CommandColors.SUCCESS)
                        .setFooter(generateSuccessFooter(self)[lang])
                        .setDescription(`## Vous êtes sur le point d'ajouter des utilisateurs à la list`)
                        .addFields({
                            name: `📜 Dernier ajout`,
                            value: `\`\`\`ANSI\n${
                                action
                                    ? `UTILISATEUR: ${green(target!.username)}\nPAR: ${green(executor!.username)}\nPOUR: ${yellow(reason!)}`
                                    : green(
                                          `Il n'y a pas d'utilisateur dans la liste ${sub === 'white' ? 'blanche' : 'noire'}.`
                                      )
                            }\`\`\``
                        });
                    const myUpdatedRow1 = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                        new UserSelectMenuBuilder()
                            .setCustomId(`managers-${sub}-user`)
                            .setDisabled(false)
                            .setMaxValues(25)
                            .setMinValues(1)
                            .setPlaceholder('Sélectionnes les utilisateurs à ajouter.')
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
                                .setDescription(`## Vous êtes sur le point d'ajouter des utilisateurs à la liste.`)
                                .addFields({
                                    name: `📜 Dernier ajout`,
                                    value: `\`\`\`ANSI\n${
                                        action
                                            ? `UTILISATEUR: ${green(target!.username)}\nPAR: ${green(executor!.username)}\nPOUR: ${yellow(reason!)}`
                                            : green(
                                                  `il n'y a pas d'utilisateur sur la liste ${sub === 'white' ? 'blanche' : 'noire'}.`
                                              )
                                    }\`\`\``
                                });
                            const myUpdatedRow1 =
                                new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
                                    new UserSelectMenuBuilder()
                                        .setCustomId(`managers-${sub}-user`)
                                        .setDisabled(false)
                                        .setMaxValues(25)
                                        .setMinValues(1)
                                        .setPlaceholder('Sélectionnes les utilisateurs à ajouter à la liste.')
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
