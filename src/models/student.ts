import { model, Schema } from 'mongoose';

interface Student {
  grade: number;
  classNum: number;
  numberInClass: number;
  name: string;
  subjects: string[];
  loginDevice: string;
}

export const StudentSchema = new Schema<Student>({
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
    required: true,
  },
});

export const StudentModel = model('Student', StudentSchema);
