import Self from '../classes/Self';
import Database from './Database';
import { LangTypes } from '../types/options';
import { InteractionsResolvable } from '../types/commands';
import { InteractionEditReplyOptions, InteractionReplyOptions, MessageCreateOptions, MessagePayload } from 'discord.js';

export class Precondition {
    public unacceptanceFunction: (
        self: Self,
        db: Database,
        interaction: InteractionsResolvable,
        lang: LangTypes,
        ephemeral: boolean
    ) =>
        | (InteractionEditReplyOptions | InteractionReplyOptions | MessagePayload)
        | Promise<InteractionEditReplyOptions | InteractionReplyOptions | MessagePayload>;
    public name: string;
    public verifyCondition: (
        self: Self,
        db: Database,
        interaction: InteractionsResolvable,
        lang: LangTypes
    ) => Promise<boolean> | boolean;

    constructor(
        name: string,
        unacceptanceFunction: (
            self: Self,
            db: Database,
            interaction: InteractionsResolvable,
            lang: LangTypes,
            ephemeral: boolean
        ) =>
            | (InteractionEditReplyOptions | InteractionReplyOptions | MessagePayload)
            | Promise<InteractionEditReplyOptions | InteractionReplyOptions | MessagePayload>,
        verifyCondition: (
            self: Self,
            db: Database,
            interaction: InteractionsResolvable,
            lang: LangTypes
        ) => Promise<boolean> | boolean
    ) {
        this.verifyCondition = verifyCondition;
        this.unacceptanceFunction = unacceptanceFunction;
        this.name = name;
    }
}
