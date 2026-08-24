import { apiClient } from "./client";

export const instructorApi = {
  // COURSES
  getMyCourses: async () => {
    const res = await apiClient.get('/courses/instructor/my-courses');
    return res.data.data.courses;
  },

  getCourseById: async (id: string) => {
    const res = await apiClient.get(`/courses/instructor/course/${id}`);
    console.log(res);
    return res.data.data.course;
  },

  createCourse: async (payload: any) => {
    const res = await apiClient.post('/courses/', payload);
    return res.data.data.course;
  },

  updateCourse: async (
    id: string,
    payload: any
  ) => {
    const res = await apiClient.put(
      `/courses/${id}`,
      payload
    );

    return res.data.data.course;
  },

  deleteCourse: async (id: string) => {
    const res = await apiClient.delete(`/courses/${id}`);
    return res.data;
  },

  togglePublish: async (id: string) => {
    const res = await apiClient.patch(
      `/courses/${id}/publish`
    );

    return res.data.data.course;
  },

    // instructor.api.ts

    getCategories: async () => {
    const res = await apiClient.get('/categories');
    return res.data.data.categories;
    },

    getSubcategories: async (categoryId: string) => {
    const res = await apiClient.get(
        `/categories/${categoryId}/subcategories`
    );

    return res.data.data.subcategories;
    },

   // ─────────────────────────────────────────
  // CURRICULUM
  // ─────────────────────────────────────────

  createSection: async (
    courseId: string,
    payload: any
  ) => {
    const res = await apiClient.post(
      `/courses/${courseId}/sections`,
      payload
    );

    return res.data.data.section;
  },

  updateSection: async (
    courseId: string,
    sectionId: string,
    payload: any
  ) => {
    const res = await apiClient.put(
      `/courses/${courseId}/sections/${sectionId}`,
      payload
    );

    return res.data.data.section;
  },

  deleteSection: async (
    courseId: string,
    sectionId: string
  ) => {
    const res = await apiClient.delete(
      `/courses/${courseId}/sections/${sectionId}`
    );

    return res.data;
  },

  createLesson: async (
    courseId: string,
    sectionId: string,
    payload: any
  ) => {
    const res = await apiClient.post(
      `/courses/${courseId}/sections/${sectionId}/lessons`,
      payload
    );

    return res.data.data.lesson;
  },

  updateLesson: async (
    courseId: string,
    sectionId: string,
    lessonId: string,
    payload: any
  ) => {
    const res = await apiClient.put(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      payload
    );

    return res.data.data.lesson;
  },

  deleteLesson: async (
    courseId: string,
    sectionId: string,
    lessonId: string
  ) => {
    const res = await apiClient.delete(
      `/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`
    );

    return res.data;
  },


  // PROFILE
  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.data.user;
  },

  updateProfile: async (payload: any) => {
    const res = await apiClient.put(
      '/users/profile',
      payload
    );

    return res.data.data.user;
  },

  // ANALYTICS
  getAnalytics: async () => {
    const res = await apiClient.get(
      '/instructor/analytics'
    );

    return res.data.data;
  },

  // ─────────────────────────────────────────
  // QUIZZES
  // ─────────────────────────────────────────
  getQuizByLesson: async (lessonId: string) => {
    const res = await apiClient.get(`/quizzes/lessons/${lessonId}/quiz`);
    return res.data; // Returns the standard wrapper so res.data.quiz can be parsed
  },

  saveQuiz: async (lessonId: string, payload: any) => {
    const res = await apiClient.post(`/quizzes/lessons/${lessonId}/quiz`, payload);
    return res.data.data.quiz;
  },

  deleteQuiz: async (lessonId: string) => {
    const res = await apiClient.delete(`/quizzes/lessons/${lessonId}/quiz`);
    return res.data;
  },

  // ─────────────────────────────────────────
  // ASSIGNMENTS
  // ─────────────────────────────────────────
  getAssignmentByLesson: async (lessonId: string) => {
    const res = await apiClient.get(`/assignments/lessons/${lessonId}/assignment`);
    return res.data; // Returns the standard wrapper so res.data.assignment can be parsed
  },

  generateAIQuiz: async (lessonId: string) => {
    const res = await apiClient.get(`/assignments/lessons/${lessonId}/assignment`);
    return res.data; // Returns the standard wrapper so res.data.assignment can be parsed
  },

  saveAssignment: async (lessonId: string, payload: any) => {
    const res = await apiClient.post(`/assignments/lessons/${lessonId}/assignment`, payload);
    return res.data.data.assignment;
  },

  deleteAssignment: async (lessonId: string) => {
    const res = await apiClient.delete(`/assignments/lessons/${lessonId}/assignment`);
    return res.data;
  },
};