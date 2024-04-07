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
    path: '/users/:userId',
    name: 'UserDetail',
    component: () => import('@/views/UserDetail.vue'), // Adjust path as needed
    meta: {
      requiresAdmin: true // Custom flag to check for admin role
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
  const role = localStorage.getItem('user-role'); 

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  if (loggedIn && to.path === '/login') {
    if (role === 'parent') {
      return next('/parent-overview');
    } else if (role === 'child') {
      return next('/child-overview'); // Redirect child role to ChildOverview
    }
  }

  next();
});

export default router;
