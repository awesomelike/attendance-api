import moment from 'moment';
import timeSlots from '../data/timeslots.json';
import { getCurrentSemester } from '../controllers/semester';

export const parseTime = (time) => ({
  hour: parseInt(time.split(':')[0], 10),
  minute: parseInt(time.split(':')[1], 10),
});

export const getSemesterTimeOffset = (
  semesterStartDate, { weekDayId, timeSlots: ts }, week,
) => moment(semesterStartDate)
  .add(weekDayId - 1, 'days')
  .add(parseTime(ts[0].startTime).hour, 'hours')
  .add(parseTime(ts[0].startTime).minute, 'minutes')
  .add(week - 1, 'weeks');

export const TIME = new Date(2019, 8, 18, 10, 30, 0);
// export const TIME = new Date(2019, 8, 27, 9, 0, 0);

// export const TIME = new Date(2019, 8, 24, 16, 0, 0);
// export const TIME = new Date(2019, 8, 24, 14, 0, 0);

// export const TIME = new Date(2019, 8, 23, 12, 0, 0);

const dynamicGenerator = () => {
  // const timeNow = new Date();
  const timeNow = TIME;
  return timeSlots.map(({ id, startTime, endTime }) => ({
    id,
    startTime: new Date(
      timeNow.getFullYear(),
      timeNow.getMonth(),
      timeNow.getDate(),
      parseTime(startTime).hour,
      parseTime(startTime).minute,
    ).getTime(),
    endTime: new Date(
      timeNow.getFullYear(),
      timeNow.getMonth(),
      timeNow.getDate(),
      parseTime(endTime).hour,
      parseTime(endTime).minute,
    ).getTime(),
  }));
};

export default {
  getCurrentTimeSlotId() {
    // const timeNow = (new Date()).getTime();
    const timeNow = TIME.getTime();
    try {
      const { id } = dynamicGenerator(timeSlots)
        .find((timeSlot) => timeNow >= timeSlot.startTime && timeNow < timeSlot.endTime);
      return id;
    } catch (error) {
      return undefined;
    }
  },
  async getCurrentWeek(date) {
    return new Promise((resolve, reject) => {
      getCurrentSemester()
        .then(({ startDate: semesterStartDate }) => {
          const week = moment(date || TIME).week() - moment(semesterStartDate).week() + 1; // FOR STARTING CLASS
          // const week = moment(date).week() - moment(semesterStartDate).week() + 1; //FOR OTHER
          resolve(week);
        })
        .catch((error) => reject(error));
    });
  },
  isToday(date) {
    return moment(date).startOf('day').valueOf() === moment(new Date(2020, 6, 31)).startOf('day').valueOf();
  },
};
