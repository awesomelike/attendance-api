import timeSlots from '../data/timeslots';
import { Semester } from '../models';

const dynamicGenerator = () => {
  const parseTime = (time) => ({
    hour: parseInt(time.split(':')[0], 10),
    minute: parseInt(time.split(':')[1], 10),
  });
  const timeNow = new Date();
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
    const timeNow = (new Date()).getTime();
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
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Set to nearest Thursday: current date + 4 - current day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      // Get first day of year
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      // Calculate full weeks to nearest Thursday
      const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
      // Return array of year and week number
      return weekNo;
    };
    const semesterStartDate = (await Semester.findByPk(2)).startDate;
    // console.log(`semesterStartDate=${semesterStartDate.getTime()}`);
    // console.log(`${new Date(2019, 8, 9).getTime() === semesterStartDate.getTime()}`);
    return getWeekNumber(new Date(2019, 8, 27)) - getWeekNumber(semesterStartDate) + 1;
  },
};
