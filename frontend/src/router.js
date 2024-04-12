import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import ParentOverview from './views/ParentOverview.vue';
import ChildOverview from './views/ChildOverview.vue';
import AdminOverview from './views/AdminOverview.vue';
import AdminUserOverview from './views/AdminUserOverview.vue';
import ActivityDetail from './views/ActivityDetail.vue';
import ParentBookedOverview from './views/ParentBookedOverview.vue';
import ParentsCalendar from './views/ParentsCalendar.vue';
import AdminCalendar from './views/AdminCalendar.vue';
import TeacherOverview from './views/TeacherOverview.vue';
import ActivityDetailParents from './views/ActivityDetailParents.vue';



const routes = [
  {
    path: '/login',
    name: 'LoginPage', 
    component: LoginPage
  },
  {
    path: '/parent-overview',
    name: 'ParentOverview', 
    component: ParentOverview
  },
  {
    path: '/child-overview',
    name: 'ChildOverview',
    component: ChildOverview
  },
  {
    path: '/admin-overview',
    name: 'AdminOverview', 
    component: AdminOverview,
    beforeEnter: (to, from, next) => { 
      const role = localStorage.getItem('user-role');
      if (role === 'admin') {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/admin-calendar', 
    name: 'AdminCalendar',
    component: AdminCalendar,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      if (role === 'admin') {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/activity/:activityId',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetail.vue')
  },
  {
    path: '/parent-booked-overview',
    name: 'ParentBookedOverview',
    component: ParentBookedOverview,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      if (loggedIn && role === 'parent') {
        next();
      } else {
        next('/login'); 
      }
    }
  },
  {
    path: '/parents-calendar',
    name: 'ParentsCalendar',
    component: ParentsCalendar,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      if (loggedIn && role === 'parent') {
        next();
      } else {
        next('/login'); 
      }
    }
  },  
  {
    path: '/admin-user-overview',
    name: 'AdminUserOverview',
    component: AdminUserOverview,
    beforeEnter: (to, from, next) => {
      const role = localStorage.getItem('user-role');
      if (role === 'admin') {
        next();
      } else {
        next('/login'); 
      }
    }
  },
  {
    path: '/teacher-overview',
    name: 'TeacherOverview',
    component: TeacherOverview,
    beforeEnter: (to, from, next) => {
      const role = (localStorage.getItem('user-role') || '').trim();
      if (role === 'teacher') {
        next();
      } else {
        next('/login');
      }
    }
  },
  {
    path: '/users/:userId',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue'), 
    meta: {
      requiresAdmin: true 
    }
  },
  {
    path: '/parent-activity/:activityId',
    name: 'ActivityDetailParents',
    component: ActivityDetailParents,
    beforeEnter: (to, from, next) => {
      const loggedIn = localStorage.getItem('user-token');
      const role = localStorage.getItem('user-role');
      if (loggedIn && (role === 'parent' || role === 'child')) {
        next();
      } else {
        next('/login');
      }
    }
  },  
  {
    path: '/activity/:activityId',
    name: 'ActivityDetail',
    component: () => import('@/views/ActivityDetail.vue')
  },
  {
    path: '/activities/:activityId',
    name: 'ActivityDetail',
    component: ActivityDetail
  },
];

// Create router instance
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user-token');
  // Use a fallback value for role to ensure it's always a string
  const role = (localStorage.getItem('user-role') || '').trim();

  // Redirect to login page if not logged in and trying to access a restricted page
  if (authRequired && !loggedIn) {
    next('/login');
    return;
  }

  // Redirect based on role if already logged in and trying to access the login page
  if (loggedIn && to.path === '/login') {
    switch (role) {
      case 'parent':
        next('/parent-overview');
        break;
      case 'child':
        next('/child-overview');
        break;
      case 'teacher':
        next('/teacher-overview');
        break;
      default:
        next('/login');
        break;
    }
  } else {
    next();
  }
});

export default router;
