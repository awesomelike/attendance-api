import timeSlots from '../data/timeslots.json';
import { Semester } from '../models';

export const parseTime = (time) => ({
  hour: parseInt(time.split(':')[0], 10),
  minute: parseInt(time.split(':')[1], 10),
});

const dynamicGenerator = () => {
  // const timeNow = new Date();
  const timeNow = (new Date(2019, 8, 23, 10, 35, 0));
  return timeSlots.map(({ id, startTime, endTime }) => ({
    id,
    startTime: new Date(timeNow.getFullYear(),
      timeNow.getMonth(),
      timeNow.getDate(),
      parseTime(startTime).hour,
      parseTime(startTime).minute).getTime(),
    endTime: new Date(timeNow.getFullYear(),
      timeNow.getMonth(), timeNow.getDate(),
      parseTime(endTime).hour,
      parseTime(endTime).minute).getTime(),
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
    const getWeekNumber = (d) => {
      // eslint-disable-next-line no-param-reassign
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      return weekNo;
    };
    const semesterStartDate = (await Semester.findByPk(2)).startDate;
    // return getWeekNumber(new Date()) - getWeekNumber(semesterStartDate) + 1;
    return getWeekNumber(new Date(2019, 8, 23)) - getWeekNumber(semesterStartDate) + 1;
  },
};
