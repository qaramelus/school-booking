export function logout(router) {

    localStorage.removeItem('user-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-id'); 

    router.push({ name: 'LoginPage' }); 
}
