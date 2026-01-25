const { createBullBoard } = require("@bull-board/api");
const { BullMQAdapter } = require("@bull-board/api/bullMQAdapter");
const { ExpressAdapter } = require("@bull-board/express");

const { courseQueue, lessonQueue } = require("./queues");

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(courseQueue),
    new BullMQAdapter(lessonQueue),
  ],
  serverAdapter,
});

module.exports = serverAdapter;
