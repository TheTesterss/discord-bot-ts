import mongoose, { Document } from 'mongoose';

interface Blacklist {
    isBlacklisted: boolean;
    by?: string;
    dates?: {
        from?: Date;
        to?: Date;
    };
    reason?: string;
    evidences?: (Buffer | string)[];
    warns?: Warn[];
}

interface Whitelist {
    isWhitelisted: boolean;
    by?: string;
    dates?: {
        from?: Date;
    };
}

interface Warn {
    id: string;
    when?: Date;
    by: string;
    reason?: string;
    deleted?: boolean;
}

export interface UserDocument extends Document {
    id: string;
    username: string;
    blacklist?: Blacklist;
    whitelist?: Whitelist;
}

const warnSchema = new mongoose.Schema<Warn>({
    when: { type: Date },
    by: { type: String }, // ? Returns an user's ID.
    reason: { type: String },
    deleted: { type: Boolean, default: false }
});

const blackListSchema = new mongoose.Schema<Blacklist>({
    isBlacklisted: { type: Boolean, default: false },
    by: { type: String }, // ? Returns an user's ID.
    dates: {
        from: { type: Date },
        to: { type: Date }
    },
    reason: { type: String },
    evidences: { type: Array<Buffer | String> }, // ? Screenshots, videos, etc.
    warns: { type: [warnSchema], default: [] }
});

const whiteListSchema = new mongoose.Schema<Whitelist>({
    isWhitelisted: { type: Boolean, default: false },
    by: { type: String }, // ? Returns an user's ID.
    dates: {
        from: { type: Date }
    }
});

export default mongoose.model(
    'User',
    new mongoose.Schema<UserDocument>({
        id: { type: String, required: true, unique: true },
        username: { type: String, default: 'Unknown' },
        blacklist: blackListSchema,
        whitelist: whiteListSchema
    })
);
