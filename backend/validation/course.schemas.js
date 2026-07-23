const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");
const empty = z.object({}).optional().default({});

const generateOutlineSchema = z.object({
  body: z.object({ prompt: z.string().trim().min(3).max(500) }),
  params: empty,
  query: empty,
});

const courseIdParamSchema = z.object({
  body: empty,
  params: z.object({ id: objectId }),
  query: empty,
});

const resolveCourseSchema = z.object({
  body: empty,
  params: z.object({ courseId: objectId }),
  query: empty,
});

const generateLessonSchema = z.object({
  body: z.object({ lessonId: objectId }),
  params: empty,
  query: empty,
});

const lessonQuerySchema = z.object({
  body: empty,
  params: empty,
  query: z.object({ moduleId: objectId, lessonId: objectId }),
});

const completeLessonSchema = z.object({
  body: z.object({
    moduleId: objectId,
    lessonId: objectId,
    quizScore: z.number().min(0).max(100).optional(),
  }),
  params: empty,
  query: empty,
});

module.exports = {
  generateOutlineSchema,
  courseIdParamSchema,
  resolveCourseSchema,
  generateLessonSchema,
  lessonQuerySchema,
  completeLessonSchema,
};
