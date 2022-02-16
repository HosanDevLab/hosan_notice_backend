import { model, ObjectId, Schema } from 'mongoose';

interface Student {
  uid: string;
  grade: number;
  classNum: number;
  numberInClass: number;
  name: string;
  subjects: string[];
  classes: ObjectId[];
  loginDevice?: string;
  loginDeviceName?: string;
  refreshToken?: string;
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
    classes: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Class',
      },
    ],
    loginDevice: {
      type: String,
    },
    loginDeviceName: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { collection: 'students' }
);

export const StudentModel = model('Student', StudentSchema);
