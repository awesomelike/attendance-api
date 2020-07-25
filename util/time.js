import moment from 'moment';
import timeSlots from '../data/timeslots.json';
import { Semester } from '../models';
import { getCurrentSemester } from '../controllers/semester';

export const parseTime = (time) => ({
  hour: parseInt(time.split(':')[0], 10),
  minute: parseInt(time.split(':')[1], 10),
});

export const getSemesterTimeOffset = (
  semesterStartDate, classObject, week,
) => moment(semesterStartDate)
  .add(classObject.weekDayId - 1, 'days')
  .add(parseTime(classObject.timeSlots[0].startTime).hour, 'hours')
  .add(parseTime(classObject.timeSlots[0].startTime).minute, 'minutes')
  .add(week - 1, 'weeks');


const dynamicGenerator = () => {
  // const timeNow = new Date();
  const timeNow = (new Date(2019, 8, 23, 10, 35, 0));
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
    const timeNow = (new Date(2019, 8, 23, 10, 35, 0)).getTime();
    try {
      const { id } = dynamicGenerator(timeSlots)
        .find((timeSlot) => timeNow >= timeSlot.startTime && timeNow < timeSlot.endTime);
      return id;
    } catch (error) {
      return undefined;
    }
  },
  async getCurrentWeek() {
    return new Promise((resolve, reject) => {
      // return getWeekNumber(new Date()) - getWeekNumber(semesterStartDate) + 1;
      getCurrentSemester()
        .then(({ startDate: semesterStartDate }) => {
          const week = moment(new Date(2019, 8, 23)).week() - moment(semesterStartDate).week() + 1;
          resolve(week);
        })
        .catch((error) => reject(error));
    });
  },
  isToday(date) {
    return moment(date).startOf('day').valueOf() === moment(new Date(2020, 6, 31)).startOf('day').valueOf();
  },
};
