$(document).ready(() => {
  const server = '';
  // const server = 'https://dssolutions.herokuapp.com';

  // constants
  const CONST_SCREEN_ID = 'screenId';
  const CONST_SCREEN_CODE = 'screenCode';

  const $inputScreenId = $('#inputScreenId');
  const $inputScreenCode = $('#inputScreenCode');
  const $btnLogin = $('#btnLogin');
  const $loginFlash = $('#loginFlash');

  // ==================== Functions ===============================
  async function doLogin(screenId, screenCode) {
    try {
      const res = await $.post(`${server}/api/screen/login`, { screen: { screenId, screenCode } });
      console.log('Screen logged in. data: ', res);
      return true;
    } catch (err) {
      console.log('Error! ', err.toString());
      return false;
    }
  }

  // login action
  async function loginAction(screenId, screenCode) {
    if (await doLogin(screenId, screenCode)) {
      SCREEN_ID = screenId;
      localStorage.setItem(CONST_SCREEN_ID, screenId);
      localStorage.setItem(CONST_SCREEN_CODE, screenCode);
      return true;
    }
    $loginFlash.html('Login Failed').addClass('text-danger').fadeOut(5000, function () {
      $(this).html('');
    });
    return false;
  }

  // siging in
  $btnLogin.click(async () => {
    const screenId = $inputScreenId.val();
    const screenCode = $inputScreenCode.val();
    if (await loginAction(screenId, screenCode)) {
      window.location.replace('/app');
    }
  });

  // auto Login
  async function checkAutoLogin() {
    if (localStorage.getItem(CONST_SCREEN_ID) && localStorage.getItem(CONST_SCREEN_CODE)) {
      // eslint-disable-next-line max-len
      const loginRes = await loginAction(localStorage.getItem(CONST_SCREEN_ID), localStorage.getItem(CONST_SCREEN_CODE));
      if (loginRes) {
        console.log('Logged in');
        window.location.replace('/app');
      }
    }
  }

  // =================== Main =====================================

  // check auto login
  checkAutoLogin();
});
