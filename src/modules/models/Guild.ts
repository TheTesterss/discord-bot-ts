import mongoose, { Document } from 'mongoose';
import { LangType, LangTypes } from '../../types/options';

export interface GuildDocument extends Document {
    id: string;
    name: string;
    lang: LangTypes;
}

export default mongoose.model(
    'Guild',
    new mongoose.Schema<GuildDocument>({
        id: { type: String, required: true, unique: true },
        name: { type: String, default: 'Unknown' },
        lang: { type: String, enum: LangType, default: LangType.EN }
    })
);
