import { model, ObjectId, Schema } from 'mongoose';

export interface Student {
  uid: string;
  grade: number;
  classNum: number;
  numberInClass: number;
  name: string;
  subjects: {
    '1st': ObjectId[];
    '2nd': ObjectId[];
  };
  classes: ObjectId[];
  loginDevice?: string;
  loginDeviceName?: string;
  refreshToken?: string;
  fcmToken?: string;
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
      '1st': [
        {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Subject',
        },
      ],
      '2nd': [
        {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Subject',
        },
      ],
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
    fcmToken: {
      type: String,
    },
  },
  { collection: 'students' }
);

export const StudentModel = model('Student', StudentSchema);
