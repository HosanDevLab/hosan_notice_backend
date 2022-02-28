import { model, ObjectId, Schema } from 'mongoose';

interface Class {
  grade: number;
  classNum: number;
  teacher: ObjectId;
  students: ObjectId[];
}

export const ClassSchema = new Schema<Class>(
  {
    grade: {
      type: Number,
      required: true,
    },
    classNum: {
      type: Number,
      required: true,
    },
    teacher: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Teacher',
    },
    students: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Student',
      },
    ],
  },
  { collection: 'classes' }
);

export const ClassModel = model('Class', ClassSchema);
