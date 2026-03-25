import { EmbedFooterData } from 'discord.js';
import { LangTypes } from '../types/options';
import Self from '../classes/Self';

export const generateSuccessFooter = (self: Self): Record<LangTypes, EmbedFooterData> => {
    return {
        fr: {
            text: '200 - Succès',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        },
        en: {
            text: '200 - Success',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        }
    };
};

export const generateNotFoundErrorFooter = (self: Self): Record<LangTypes, EmbedFooterData> => {
    return {
        fr: {
            text: '404 - Introuvable',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        },
        en: {
            text: '404 - Not Found',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        }
    };
};

export const generateInternalErrorFooter = (self: Self, name: string): Record<LangTypes, EmbedFooterData> => {
    return {
        fr: {
            text: `501 - Problème interne - ${name}`,
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        },
        en: {
            text: `501 - Internal problems - ${name}`,
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        }
    };
};

export const generateMissingAccessFooter = (self: Self): Record<LangTypes, EmbedFooterData> => {
    return {
        fr: {
            text: "401 - Manque d'accès",
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        },
        en: {
            text: '401 - Missing access',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        }
    };
};

export const generateDeniedAccessFooter = (self: Self): Record<LangTypes, EmbedFooterData> => {
    return {
        fr: {
            text: '403 - Accès dénié',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        },
        en: {
            text: '403 - Denied access',
            iconURL:
                self.djsClient.user?.avatarURL({
                    extension: 'jpg',
                    forceStatic: true,
                    size: 2048
                }) ?? undefined
        }
    };
};
