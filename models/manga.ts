import mongoose, { Schema, Document } from "mongoose";

export interface IManga extends Document {
  id: number;
  title: string;
  genre: string;
  releaseDate: string;
  coverImage?: string;
  image?: string;
  description?: string;
  volumes?: number;
  ongoing?: boolean;
  tags?: string[];
  authorId?: string;
}

const MangaSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  genre: { type: String },
  releaseDate: { type: String },
  coverImage: { type: String },
  image: { type: String },
  description: { type: String },
  volumes: { type: Number },
  ongoing: { type: Boolean },
  tags: { type: [String], default: [] },
  authorId: { type: String }
});

export default mongoose.model<IManga>("Manga", MangaSchema);