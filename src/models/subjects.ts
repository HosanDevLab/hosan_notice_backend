import { model, ObjectId, Schema } from 'mongoose';

interface Subject {
  name: string;
  grade: number;
  isRequired: boolean;
  order: number;
  teachers: ObjectId[];
}

export const SubjectSchema = new Schema<Subject>(
  {
    name: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    isRequired: {
      type: Boolean,
      required: true,
    },
    order: {
      type: Number,
      required: true,
    },
    teachers: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Teacher',
      },
    ],
  },
  { collection: 'subjects' }
);

export const SubjectModel = model('Subject', SubjectSchema);
