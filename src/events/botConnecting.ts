import { ActivityType, ApplicationCommand, Events, Guild, User } from 'discord.js';
import { EventInterface, EventType } from '../types/events';
import Self from '../classes/Self';
import Database from '../modules/Database';
import { UserDocument } from '../modules/models/User';
import { blue, yellow } from '../modules/Colors';
import { GuildDocument } from '../modules/models/Guild';
import { LangType } from '../types/options';
import * as fs from 'fs';

export = {
    name: Events.ClientReady,
    type: EventType.CLASSIC,
    once: true,
    run: async (self: Self, db: Database): Promise<void> => {
        console.log(`${blue('[EPSILON | CONNECTION]')} | I successfully connected to discord.`);
        // await self.commandManager.deleteCommands();

        // ! Handles every users of the db.
        self.djsClient.users.cache.forEach(async (user: User) => {
            const d: UserDocument | null = await db.models.UserDB.findOne({ id: user.id });
            if (d) return;
            await db.models.UserDB.create({
                id: user.id,
                username: user.username,
                whitelist: {},
                blacklist: {}
            });
            console.log(
                `${yellow('[EPSILON | DB]')} | ${yellow(user.username.toUpperCase())} has been added to the database.`
            );
        });

        // ! Handles every guilds of the db.
        self.djsClient.guilds.cache.forEach(async (guild: Guild) => {
            const d: GuildDocument | null = await db.models.GuildDB.findOne({ id: guild.id });
            if (d) return;
            await db.models.GuildDB.create({
                id: guild.id,
                name: guild.name,
                lang: LangType.EN
            });
            console.log(
                `${yellow('[EPSILON | DB]')} | ${yellow(guild.name.toUpperCase())} has been added to the database`
            );
        });

        // ! Handles every client status.
        let activities = fetchActivities();
        setInterval(() => {
            activities = fetchActivities();
        }, 3_600_000);
        let i = 0;
        setInterval(() => {
            if (i >= activities.length) i = 0;

            self.djsClient.user?.setActivity({
                name: activities[i].text,
                type: activities[i].type,
                url: activities[i].url ?? undefined
            });
            i++;
        }, 60_000);
    }
} as EventInterface;

type StockedActivityType = {
    text: string;
    type: ActivityType;
    url?: string;
};

function fetchActivities(): StockedActivityType[] {
    const values: StockedActivityType[] =
        JSON.parse(fs.readFileSync('./src/utils/data/activities.json', 'utf-8')) ?? [];

    return values;
}
