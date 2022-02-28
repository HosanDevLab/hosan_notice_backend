import { model, ObjectId, Schema } from 'mongoose';

export interface Teacher {
  name: string;
  classroom: ObjectId;
  subjects: ObjectId[];
  isChief: boolean;
}

export const TeacherSchema = new Schema<Teacher>(
  {
    name: {
      type: String,
      required: true,
    },
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Class',
    },
    subjects: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Subject',
      },
    ],
    isChief: {
      type: Boolean,
      required: true,
    },
  },
  { collection: 'teachers' }
);

export const TeacherModel = model('Teacher', TeacherSchema);
