import mongoose, { InferSchemaType, Schema } from "mongoose";

const ProbSchema = new Schema(
  {
    label: { type: String, required: true },
    probability: { type: Number, required: true },
  },
  { _id: false },
);

const AnalysisSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    filename: { type: String },
    genre: { type: String, required: true },
    probabilities: { type: [ProbSchema], default: [] },
    durationSec: { type: Number },
  },
  { timestamps: true },
);

export type AnalysisDoc = InferSchemaType<typeof AnalysisSchema> & { _id: mongoose.Types.ObjectId };

export const Analysis = mongoose.models.Analysis || mongoose.model("Analysis", AnalysisSchema);
