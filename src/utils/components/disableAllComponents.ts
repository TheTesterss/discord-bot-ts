import {
    ActionRowBuilder,
    ButtonBuilder,
    ChannelSelectMenuBuilder,
    ComponentType,
    MentionableSelectMenuBuilder,
    Message,
    MessageActionRowComponentBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder
} from 'discord.js';

export default (message: Message) => {
    return message.components.map((row) => {
        const actionRow = new ActionRowBuilder<MessageActionRowComponentBuilder>();

        actionRow.addComponents(
            row.components.map((component): MessageActionRowComponentBuilder => {
                switch (component.type) {
                    case ComponentType.Button:
                        return ButtonBuilder.from(component).setDisabled(true);
                    case ComponentType.ChannelSelect:
                        return ChannelSelectMenuBuilder.from(component).setDisabled(true);
                    case ComponentType.MentionableSelect:
                        return MentionableSelectMenuBuilder.from(component).setDisabled(true);
                    case ComponentType.RoleSelect:
                        return RoleSelectMenuBuilder.from(component).setDisabled(true);
                    case ComponentType.StringSelect:
                        return StringSelectMenuBuilder.from(component).setDisabled(true);
                    case ComponentType.UserSelect:
                        return UserSelectMenuBuilder.from(component).setDisabled(true);
                    default:
                        return ButtonBuilder.from(component as any).setDisabled(true);
                }
            })
        );

        return actionRow.toJSON();
    }) as NonNullable<Message['components']>;
};
