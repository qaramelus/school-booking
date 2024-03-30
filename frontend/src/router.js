import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './views/LoginPage.vue';
import ParentOverview from './views/ParentOverview.vue';
import ChildOverview from './views/ChildOverview.vue';

// Define routes
const routes = [
  {
    path: '/login',
    name: 'LoginPage', // Use 'LoginPage' for navigation
    component: LoginPage
  },
  {
    path: '/parent-overview',
    name: 'ParentOverview', // Use 'ParentOverview' for navigation
    component: ParentOverview
  },
  {
    path: '/child-overview',
    name: 'ChildOverview',
    component: ChildOverview
  }
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
