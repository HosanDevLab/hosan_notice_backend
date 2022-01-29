import { model, Schema } from 'mongoose';

interface Student {
  uid: string;
  grade: number;
  classNum: number;
  numberInClass: number;
  name: string;
  subjects: string[];
  loginDevice: string;
}

export const StudentSchema = new Schema<Student>(
  {
    uid: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      required: true,
    },
    classNum: {
      type: Number,
      required: true,
    },
    numberInClass: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    subjects: {
      type: [String],
      required: true,
    },
    loginDevice: {
      type: String,
    },
  },
  { collection: 'students' }
);

export const StudentModel = model('Student', StudentSchema, 'students');
