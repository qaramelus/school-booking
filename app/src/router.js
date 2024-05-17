import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import ParentOverview from './views/ParentOverview.vue';
import ChildOverview from './views/ChildOverview.vue';
import AdminOverview from './views/AdminOverview.vue';
import AdminUserOverview from './views/AdminUserOverview.vue';
import AdminLocationOverview from './views/AdminLocationOverview.vue';
import ActivityDetail from './views/ActivityDetail.vue';
import ParentBookedOverview from './views/ParentBookedOverview.vue';
import ParentsCalendar from './views/ParentsCalendar.vue';
import AdminCalendar from './views/AdminCalendar.vue';
import TeacherOverview from './views/TeacherOverview.vue';
import ActivityDetailParents from './views/ActivityDetailParents.vue';
import ActivityDetailTeacher from './views/ActivityDetailTeacher.vue';
import TeacherCalendar from './views/TeacherCalendar.vue';

const routes = [
  { path: '/login', name: 'LoginPage', component: LoginPage },
  { path: '/parent-overview', name: 'ParentOverview', component: ParentOverview },
  { path: '/child-overview', name: 'ChildOverview', component: ChildOverview },
  { 
    path: '/admin-overview', 
    name: 'AdminOverview', 
    component: AdminOverview,
    beforeEnter: (to, from, next) => { 
      const role = localStorage.getItem('user-role');
      role === 'admin' ? next() : next('/login');
    }
  },
  { 
    path: '/admin-calendar', 
    name: 'AdminCalendar', 
    component: AdminCalendar,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      role === 'admin' ? next() : next('/login');
    }
  },
  { path: '/activity/:activityId', name: 'ActivityDetail', component: ActivityDetail },
  { 
    path: '/parent-booked-overview', 
    name: 'ParentBookedOverview', 
    component: ParentBookedOverview,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      (loggedIn && role === 'parent') ? next() : next('/login');
    }
  },
  { 
    path: '/parents-calendar', 
    name: 'ParentsCalendar', 
    component: ParentsCalendar,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      (loggedIn && role === 'parent') ? next() : next('/login');
    }
  },  
  { 
    path: '/admin-user-overview', 
    name: 'AdminUserOverview', 
    component: AdminUserOverview,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      role === 'admin' ? next() : next('/login');
    }
  },
  { 
    path: '/admin-location-overview', 
    name: 'AdminLocationOverview', 
    component: AdminLocationOverview,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      role === 'admin' ? next() : next('/login');
    }
  },
  { 
    path: '/teacher-overview', 
    name: 'TeacherOverview', 
    component: TeacherOverview,
    beforeEnter: (to, from, next) => {
      const role = (localStorage.getItem('user-role') || '').trim();
      role === 'teacher' ? next() : next('/login');
    }
  },
  { 
    path: '/teacher-activity/:activityId', 
    name: 'ActivityDetailTeacher', 
    component: ActivityDetailTeacher,
    beforeEnter: (to, from, next) => {
      const role = (localStorage.getItem('user-role') || '').trim();
      role === 'teacher' ? next() : next('/login');
    }
  },
  { 
    path: '/teacher-calendar', 
    name: 'TeacherCalendar', 
    component: TeacherCalendar,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      role === 'teacher' ? next() : next('/login');
    }
  },
  { path: '/users/:userId', name: 'UserDetail', component: () => import('@/views/UserDetail.vue'), meta: { requiresAdmin: true } },
  { 
    path: '/parent-activity/:activityId', 
    name: 'ActivityDetailParents', 
    component: ActivityDetailParents,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      (loggedIn && (role === 'parent' || role === 'child')) ? next() : next('/login');
    }
  },
  { path: '/activities/:activityId', name: 'ActivityDetail', component: ActivityDetail },
];

// Create router instance
const router = createRouter({
  history: createWebHistory('/'),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const loggedIn = localStorage.getItem('user-token');
  const role = (localStorage.getItem('user-role') || '').trim();
  
  // Define role-based redirect mapping
  const roleRedirects = {
    parent: '/parent-overview',
    child: '/child-overview',
    teacher: '/teacher-overview',
    admin: '/admin-overview'
  };

  if (to.path === '/login') {
    if (loggedIn) {
      const redirectTo = roleRedirects[role] || '/login';
      next(redirectTo);
    } else {
      next();
    }
  } else {
    if (!loggedIn) {
      next('/login');
    } else {
      next();
    }
  }
});

export default router;
