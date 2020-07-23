export default (req, res) => {
  const { name: eventName, data } = req.event;
  if (eventName === 'newMakeup') {
    res.io.to('AFFAIRS').emit(eventName, data);
    console.log('Sent to socket');
  }
};
