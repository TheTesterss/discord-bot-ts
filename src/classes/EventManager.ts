import { Events, ClientEvents } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { red, yellow, blue } from '../modules/Colors';
import {
    EventInterface,
    CustomEvents_E,
    DatabaseEvents_E,
    EventType,
    CustomEvents,
    DatabaseEvents,
    EventTypes
} from '../types/events';
import Self from './Self';
import Database from '../modules/Database';

export default class EventManager {
    private self: Self;
    private errorText: string = '[EPSILON | ERROR]';
    private warningText: string = '[EPSILON | WARNING]';
    private runText: string = '[EPSILON | RUN]';
    private regiteredText: string = '[EPSILON | REGISTERED]';
    private eventTypes: Record<EventTypes, string> = {
        1: 'Classic',
        2: 'Custom',
        3: 'Database'
    };

    constructor(self: Self) {
        this.self = self;
    }

    private async fetchEvents(): Promise<EventInterface[]> {
        const followedModels: EventInterface[] = [];

        const track = async (dir: string): Promise<void> => {
            const files: string[] = fs.readdirSync(dir);

            for (const file of files) {
                const fullPath = path.join(dir, file);

                if (!fs.statSync(fullPath).isDirectory()) {
                    const d: EventInterface = require(fullPath);
                    followedModels.push(d);
                } else {
                    await track(fullPath);
                }
            }
        };

        await track(path.join(__dirname, '../events'));
        return followedModels;
    }

    private checkEventValidity(event: EventInterface): true {
        // ? Classic errors
        if (!event.name) throw new Error(`${red(this.errorText)} | ${red('Event name')} is a required argument.`);
        if (!event.type) throw new Error(`${red(this.errorText)} | ${red('Event type')} is a required argument.`);
        if (!event.run)
            throw new Error(`${red(this.errorText)} | You may provide a valid ${red('Event run function')}.`);

        // ? Type errors
        if (
            !Object.values(Events).includes(event.name as Events) &&
            !Object.values(CustomEvents_E).includes(event.name as CustomEvents_E) &&
            !Object.values(DatabaseEvents_E).includes(event.name as DatabaseEvents_E)
        )
            throw new TypeError(`${red(this.errorText)} | ${red('Event name')} argument must be valid.`);
        if (event.once && ![true, false].includes(event.once))
            throw new TypeError(`${red(this.errorText)} | ${red('Event once')} argument must be a boolean.`);
        if (!(event.type in this.eventTypes))
            throw new TypeError(
                `${red(this.errorText)} | ${red('Event type')} must be a valid type. Refer to ${yellow('"EventType" enum')}.`
            );

        return true;
    }

    public async runEvents(): Promise<void> {
        const followedModels: EventInterface[] = await this.fetchEvents();
        for (const model of followedModels) {
            this.checkEventValidity(model);
            switch (model.type) {
                case EventType.CLASSIC:
                    this.self.djsClient[model.once ? 'once' : 'on'](
                        model.name as keyof ClientEvents,
                        async (...args: any[]) => model.run(this.self, this.self.database, ...args)
                    );
                    break;
                case EventType.CUSTOM:
                    this.self[model.once ? 'once' : 'on'](model.name as keyof CustomEvents, async (...args: any[]) =>
                        model.run(...args)
                    );
                    break;
                case EventType.DATABASE:
                    this.self.database[model.once ? 'once' : 'on'](
                        model.name as keyof DatabaseEvents,
                        async (...args: any[]) => model.run(...args)
                    );
                    break;
            }

            console.log(` | ${blue(model.name)} event has been registered.`);
        }
    }
}
