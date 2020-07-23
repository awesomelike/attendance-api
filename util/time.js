import moment from 'moment';
import timeSlots from '../data/timeslots.json';
import { Semester } from '../models';

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
    const semesterStartDate = (await Semester.findByPk(2)).startDate;
    // return getWeekNumber(new Date()) - getWeekNumber(semesterStartDate) + 1;
    return moment(new Date(2019, 8, 23)).week() - moment(semesterStartDate).week() + 1;
  },
};
