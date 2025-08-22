import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMatch extends Document {
  gameTitle: string;
  sport: string;              // e.g., "Football", "Cricket"
  date: string;               // "YYYY-MM-DD"
  time: string;               // "HH:mm"
  location: string;           // free text or "lat,lng" in future
  playersNeeded: number;      // minimum players needed
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    gameTitle: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    sport:     { type: String, required: true, trim: true, maxlength: 50 },
    date:      { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    time:      { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    location:  { type: String, required: true, trim: true, maxlength: 200 },
    playersNeeded: { type: Number, required: true, min: 1, max: 1000 },
    description: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
);

export const Match: Model<IMatch> = mongoose.model<IMatch>("Match", MatchSchema);
