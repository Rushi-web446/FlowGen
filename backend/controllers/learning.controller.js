const { saveUserNote } = require("../services/retrieval.service");
const { askTutor } = require("../services/tutor.service");

const createNote = async (req, res) => {
  try {
    const note = await saveUserNote({ userId: req.appUser._id, ...req.body });
    res.status(201).json({ success: true, note });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const tutorChat = async (req, res) => {
  try {
    const result = await askTutor({ userId: req.appUser._id, ...req.body });
    res.status(200).json({ success: true, ...result });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

module.exports = { createNote, tutorChat };
