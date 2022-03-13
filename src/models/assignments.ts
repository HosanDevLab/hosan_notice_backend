import { model, ObjectId, Schema } from 'mongoose';

export interface Assignment {
  title: string;
  description?: string;
  author: ObjectId;
  type: 'assignment' | 'assessment';
  subject: ObjectId;
  teacher?: string;
  classroom: ObjectId;
  deadline?: Date;
  createdAt: Date;
  hearts: ObjectId[];
}

export const AssignmentSchema = new Schema<Assignment>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
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
    },
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Class',
    },

    deadline: {
      type: Date,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    hearts: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student',
      },
    ],
  },
  { collection: 'assignments' }
);

export const AssignmentModel = model('Assignment', AssignmentSchema);
