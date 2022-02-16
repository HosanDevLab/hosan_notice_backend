import { model, ObjectId, Schema } from 'mongoose';

interface Assignment {
  title: string;
  description: string;
  type: 'assignment' | 'assessment';
  subject: ObjectId;
  teacher: string;
  classes: ObjectId[];
  deadline: Date;
  createdAt: Date;
}

export const AssignmentSchema = new Schema<Assignment>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Subject',
    },
    teacher: {
      type: String,
      required: true,
    },
    classes: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Class',
      },
    ],
    deadline: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { collection: 'assignments' }
);

export const AssignmentModel = model('Assignment', AssignmentSchema);
