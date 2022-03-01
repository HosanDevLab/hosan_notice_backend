import { model, ObjectId, Schema } from 'mongoose';

export interface Timetable {
  classroom: ObjectId;
  table: {
    dow: number;
    period: number;
    subject: ObjectId;
    teachers: ObjectId[];
  }[];
}

export const TimetableSchema = new Schema<Timetable>(
  {
    classroom: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Class',
    },
    table: [
      {
        dow: {
          type: Number,
          required: true,
        },
        period: {
          type: Number,
          required: true,
        },
        subject: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Subject',
        },
        teachers: [
          {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Teacher',
          },
        ],
      },
    ],
  },
  { collection: 'timetables' }
);

export const TimetableModel = model('Timetable', TimetableSchema);
