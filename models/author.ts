import mongoose, { Schema, Document } from "mongoose";

export interface IAuthor extends Document {
  authorId: string;
  name: string;
  nationality?: string;
  birthYear?: number;
  active?: boolean;
}

const AuthorSchema: Schema = new Schema({
  authorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nationality: { type: String },
  birthYear: { type: Number },
  active: { type: Boolean }
});

export default mongoose.model<IAuthor>("Author", AuthorSchema, "ExtraData");