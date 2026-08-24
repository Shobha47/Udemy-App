import { apiClient } from "./client";

export const adminApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data.data;
  },

  // COURSES
  getPendingCourses: async () => {
    const res = await apiClient.get('/admin/courses/pending');
    console.log(res);
    return res.data.data.courses;
  },

  getOrders: async () => {
    const res = await apiClient.get('/payments/admin/orders');
    console.log(res);
    return res.data.data;
  },

  approveCourse: async (id: string) => {
    const res = await apiClient.patch(`/admin/courses/approve/${id}`);
    console.log("approve", res);
    return res.data.data.course;
  },

  rejectCourse: async (id: string) => {
    const res = await apiClient.patch(`/admin/courses/reject/${id}`);
    return res.data.data.course;
  },
};
