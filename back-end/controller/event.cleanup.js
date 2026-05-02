import cron from 'node-cron';
import Event from '../models/event.model.js';
import Application from '../models/application.model.js';

const cleanupExpiredEvents = async () => {
  try {
    const now = new Date();

    const expiredEvents = await Event.find({
      deadline: { $lt: now },
    });

    if (!expiredEvents || expiredEvents.length === 0) {
      console.log('No expired events found, skipping...');
      return;
    }

    const expiredEventIds = expiredEvents.map((event) => event._id);
    console.log(`Found ${expiredEvents.length} expired events`);

    const closedApplications = await Application.updateMany(
      {
        event: { $in: expiredEventIds },
        status: { $in: ["saved", "interested", "in_progress"] },
      },
      {
        $set: { status: "withdrawn", lastActivityAt: new Date() },
      }
    );
    console.log(`Archived ${closedApplications.modifiedCount} open applications`);

    const deletedEvents = await Event.deleteMany({
      _id: { $in: expiredEventIds },
    });
    console.log(`Deleted ${deletedEvents.deletedCount} expired events`);

  } catch (err) {
    console.error('Cleanup job failed:', err.message);
  }
};


cron.schedule('0 0 * * *', async () => {
  console.log('Running event cleanup cron...');
  await cleanupExpiredEvents();
}, { timezone: 'Africa/Kigali' });

export default cleanupExpiredEvents;
