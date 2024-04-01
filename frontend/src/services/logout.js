export function logout(router) {
    localStorage.removeItem('user-token');
    localStorage.removeItem('user-role'); 
    router.push({ name: 'LoginPage' }); 
}
