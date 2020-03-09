const classes = [
  {
    id: 1,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Mon',
    timeslot: '10:30',
    room: 'A-202',
  },
  {
    id: 1,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Mon',
    timeslot: '11:00',
    room: 'A-202',
  },
  {
    id: 1,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Mon',
    timeslot: '11:30',
    room: 'A-202',
  },
  {
    id: 2,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Wed',
    timeslot: '10:30',
    room: 'A-202',
  },
  {
    id: 2,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Wed',
    timeslot: '11:00',
    room: 'A-202',
  },
  {
    id: 2,
    courseNumber: 'CSE2090',
    sectionNumber: '001',
    courseName: 'Signals and Systems',
    professorId: 'U15013',
    professorName: 'Chongkoo An',
    weekDay: 'Wed',
    timeslot: '11:30',
    room: 'A-202',
  },
];

const weeks = [
  {
    id: 1,
    week: 'Mon',
  },
  {
    id: 2,
    week: 'Wed',
  },
];

const timeSlots = [
  {
    id: 1,
    startTime: '09:00',
    endTime: '09:30',
  }, {
    id: 2,
    startTime: '09:30',
    endTime: '10:00',
  }, {
    id: 3,
    startTime: '10:00',
    endTime: '10:30',
  }, {
    id: 4,
    startTime: '10:30',
    endTime: '11:00',
  }, {
    id: 5,
    startTime: '11:00',
    endTime: '11:30',
  }, {
    id: 6,
    startTime: '11:30',
    endTime: '12:00',
  }, {
    id: 7,
    startTime: '12:00',
    endTime: '12:30',
  }, {
    id: 8,
    startTime: '12:30',
    endTime: '13:00',
  }, {
    id: 9,
    startTime: '13:00',
    endTime: '13:30',
  }, {
    id: 10,
    startTime: '13:30',
    endTime: '14:00',
  }, {
    id: 11,
    startTime: '14:00',
    endTime: '14:30',
  }, {
    id: 12,
    startTime: '14:30',
    endTime: '15:00',
  }, {
    id: 13,
    startTime: '15:00',
    endTime: '15:30',
  }, {
    id: 14,
    startTime: '15:30',
    endTime: '16:00',
  }, {
    id: 15,
    startTime: '16:00',
    endTime: '16:30',
  }, {
    id: 16,
    startTime: '16:30',
    endTime: '17:00',
  }, {
    id: 17,
    startTime: '17:00',
    endTime: '17:30',
  }, {
    id: 18,
    startTime: '17:30',
    endTime: '18:00',
  },
];

const ClassTimeSlot = [];

const result = [];

const filterByWeek = () => new Promise((resolve, reject) => {
  weeks.forEach(({ week }) => {
    const myClass = classes.filter(({ weekDay }) => weekDay == week);
    if (myClass.length) {
      result.push(myClass[0]);
      myClass.forEach(({ id, timeslot }) => {
        const found = timeSlots.find(({ startTime }) => startTime == timeslot);
        if (found) {
          ClassTimeSlot.push({
            classId: id,
            timeSlotId: found.id,
          });
        }
      });
    }
  });
  resolve(weeks);
});

export default (req, res) => {
  filterByWeek()
    .then(() => res.status(200).json({
      result,
      ClassTimeSlot,
    }))
    .catch((err) => res.status(502).json({ err }));
};
