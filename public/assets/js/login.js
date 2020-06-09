const $returnLoginBtn = $('.return-login');
const playerId = localStorage.getItem('id'); 

function getLogin() {
    if (!!playerId) {
        $returnLoginBtn.show()
        if (window.location.pathname === `/login/${playerId}`) {
            $returnLoginBtn.hide()
        }
    } else {
        $returnLoginBtn.hide();
    }
}

function redirect() {
    window.location.replace(`/login/${localStorage.getItem('id')}`);
}

getLogin();
$returnLoginBtn.on('click', redirect);

function handleLogin() {
    // Actual login with passport
    async function loginRequest(data) {
        try {
            return await $.post({
                url: '/user/login',
                data: data
            })
        } catch (error) {
            return error;
        }
    }
    // Event listener
    $('.login-btn').on('click', async event => {
        event.preventDefault();
        let user = {
            username: $('.username').val().trim(),
            password: $('.password').val().trim()
        }
        // console.log(user)
        let response = await loginRequest(user)
        console.log(response)
    })
}
// handleLogin()