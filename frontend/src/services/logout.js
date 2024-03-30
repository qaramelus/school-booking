export function logout(router) {
    localStorage.removeItem('user-token'); // Clear the token
    localStorage.removeItem('user-role'); // Optionally clear the user role
    router.push({ name: 'LoginPage' }); // Redirect to login
}
