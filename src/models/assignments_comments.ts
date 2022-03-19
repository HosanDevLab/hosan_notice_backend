import { model, ObjectId, Schema } from 'mongoose';

export interface AssignmentComments {
  assignment: ObjectId;
  content: string;
  author: ObjectId;
  createdAt: Date;
  hearts: ObjectId[];
  parent: ObjectId | null;
}

export const AssignmentCommentsSchema = new Schema<AssignmentComments>(
  {
    assignment: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Assignment',
    },
    content: {
      type: String,
    },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Student',
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'AssignmentComments',
    },
  },
  { collection: 'assignment_comments' }
);

export const AssignmentCommentsModel = model(
  'AssignmentComments',
  AssignmentCommentsSchema
);
