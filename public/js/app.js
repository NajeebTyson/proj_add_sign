$(document).ready(() => {
  const server = '';
  // const server = 'https://dssolutions.herokuapp.com';

  // constants
  const CONST_SCREEN_ID = 'screenId';
  const CONST_SCREEN_CODE = 'screenCode';
  const CONST_FULLSCREEN_STATUS = 'fullScreenStatus';

  // global variables
  let SCREEN_ID = null;
  let SCREEN_OBJ = null;
  let CURRENT_MEDIA_IDX = 0;
  let SHUFFLE_PLAYLIST = false;
  let CURRENT_PLAYLIST_SETUP = [];
  let SCREEN_STATUS = false;
  let FULLSCREEN_VIEW = false;

  const $btnSignout = $('#btnSignout');
  const $screenPage = $('#screenPage');
  const $monitorContent = $('#monitorContent');
  const $fullScreenPage = $('#fullScreenPage');


  //= =================== FUNCTIONS ==========================

  async function getScreen(screenId) {
    return $.get(`${server}/api/screen`, { _id: screenId });
  }

  async function getScreenByQuery(query) {
    return $.get(`${server}/api/screen`, query);
  }

  async function screenHeartbeat(query) {
    return $.get(`${server}/api/screen/heartbeat`, query);
  }

  async function getPlaylist(playlistId) {
    return $.get(`${server}/api/playlist`, { _id: playlistId });
  }

  async function getMedia(mediaId) {
    return $.get(`${server}/api/media`, { _id: mediaId });
  }

  function getHtmlMedia(media) {
    const mediaUrl = `${server}/static/media/${media.saved_name}`;
    let mediaHtml = '<div class="monitor-container">';
    if (media.type === 'image') {
      mediaHtml += `<img class="content-monitor d-block align-middle img-fluid mx-auto" src="${mediaUrl}">`;
    } else if (media.type === 'video') {
      mediaHtml += `<video id="videoContent" class="content-monitor" src="${mediaUrl}" type="${media.type}/${media.extension}" autoplay></video>`;
    }
    mediaHtml += '</div>';
    return mediaHtml;
  }

  // compare array element wise
  function arraysEqual(_arr1, _arr2) {
    if (!Array.isArray(_arr1) || !Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
      return false;
    }
    const arr1 = _arr1.concat().sort();
    const arr2 = _arr2.concat().sort();

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  }

  // shuffle array
  function shuffle(array) {
    let currentIndex = array.length; let temporaryValue; let
      randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }

  // sleep function
  function sleep(ms) {
    return new Promise(((resolve) => setTimeout(resolve, ms)));
  }

  // full screen
  function openFullscreen() {
    $fullScreenPage.removeClass('d-none');
    $screenPage.addClass('d-none');
    $monitorContent.html('');
    FULLSCREEN_VIEW = true;

    const elem = document.getElementById("fullScreenPage");
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }

  function isInFullscreen() {
    return document.fullscreenElement && document.fullscreenElement.nodeName === 'VIDEO';
  }

  // exit full screen
  function exitFullScreen() {
    console.log('Exiting full screen');
    if (isInFullscreen()) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) { /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) { /* IE/Edge */
        document.msExitFullscreen();
      }
    }
    $fullScreenPage.addClass('d-none');
    $screenPage.removeClass('d-none');
    $fullScreenPage.html('');
    FULLSCREEN_VIEW = false;
  }

  // stop play loop
  function stopPlayLoop() {
    SCREEN_STATUS = false;
    $monitorContent.html('');
  }

  // display screen stop
  function displayStoppedScreen() {
    const stopHtml = '<div class="stopScreen d-flex justify-content-center align-middle"><span>STOPPED</span></div>';
    if (FULLSCREEN_VIEW) {
      $fullScreenPage.html(stopHtml);
    } else {
      $monitorContent.html(stopHtml);
    }
  }

  // display No media screen
  function displayNoMediaScreen() {
    const stopHtml = '<div class="stopScreen d-flex justify-content-center align-middle"><span>NO MEDIA</span></div>';
    if (FULLSCREEN_VIEW) {
      $fullScreenPage.html(stopHtml);
    } else {
      $monitorContent.html(stopHtml);
    }
  }

  // display screen deleted
  function displayScreenNotAvailable() {
    const stopHtml = '<div class="not-available-screen d-flex justify-content-center align-middle"><span>SCREEN NOT AVAILABLE</span></div>';
    if (FULLSCREEN_VIEW) {
      $fullScreenPage.html(stopHtml);
    } else {
      $monitorContent.html(stopHtml);
    }
  }

  // display no playlist attached
  function displayNoPlaylistScreen() {
    const stopHtml = '<div class="not-available-screen d-flex justify-content-center align-middle"><span>NO PLAYLIST</span></div>';
    if (FULLSCREEN_VIEW) {
      $fullScreenPage.html(stopHtml);
    } else {
      $monitorContent.html(stopHtml);
    }
  }
  //= =================== END FUNCTIONS ======================

  //= =================== MIAN ===============================

  // singing out
  $btnSignout.click(() => {
    $screenPage.addClass('d-none');
    $fullScreenPage.addClass('d-none');
    stopPlayLoop();
    localStorage.clear();
    window.location.replace('/app-login');
  });

  function setupPlaylist(playlist) {
    if (!arraysEqual(CURRENT_PLAYLIST_SETUP, playlist.media)) {
      CURRENT_PLAYLIST_SETUP = playlist.media;
      if (CURRENT_MEDIA_IDX >= CURRENT_PLAYLIST_SETUP) {
        CURRENT_MEDIA_IDX = 0;
      }
    }
    if (SCREEN_OBJ.shuffle !== SHUFFLE_PLAYLIST) {
      SHUFFLE_PLAYLIST = SCREEN_OBJ.shuffle;
      if (SHUFFLE_PLAYLIST) {
        shuffle(CURRENT_PLAYLIST_SETUP);
      }
    }
    if (CURRENT_MEDIA_IDX >= CURRENT_PLAYLIST_SETUP.length) {
      CURRENT_MEDIA_IDX = 0;
    }
  }

  async function playMedia(playlist) {
    setupPlaylist(playlist);
    if (CURRENT_PLAYLIST_SETUP.length <= 0) {
      displayNoMediaScreen();
      await sleep(SCREEN_OBJ.image_duration * 1000);
      return;
    }

    const mediaId = CURRENT_PLAYLIST_SETUP[CURRENT_MEDIA_IDX];
    try {
      const media = await getMedia(mediaId);
      if (media.data.length === 0) {
        console.log('No media with this id: ', mediaId);
        CURRENT_MEDIA_IDX++;
        return;
      }
      CURRENT_MEDIA = media.data[0];
      const mediaHtml = getHtmlMedia(CURRENT_MEDIA);
      if (FULLSCREEN_VIEW) {
        $fullScreenPage.html(mediaHtml);
      } else {
        $monitorContent.html(mediaHtml);
      }
      if (CURRENT_MEDIA.type === 'image') {
        // await sleep(SCREEN_OBJ.image_duration * 100000);
        await sleep(SCREEN_OBJ.image_duration * 1000);
      } else if (CURRENT_MEDIA.type === 'video') {
        console.log('video is playing');
        await sleep(1000);
        // $('#monitorContent > video')[0].play();
        let videoIsplaying = true;
        document.addEventListener('ended', (e) => {
          console.log('ended event occurred');
          videoIsplaying = false;
        }, true);
        let counter = 1;
        while (videoIsplaying) {
          let vidHtml;
          if (FULLSCREEN_VIEW) {
            vidHtml = $fullScreenPage.html();
          } else {
            vidHtml = $monitorContent.html();
          }
          if (vidHtml === '') {
            document.removeEventListener('ended', () => {
              videoIsplaying = false;
            });
            break;
          }
          counter = counter + 1;
          if (counter % 2 === 0) {
            screenHeartbeat({ screen_id: SCREEN_ID, app: 'client' });
          }
          console.log('video, sleeping for 5');
          await sleep(5000);
        }
      }
    } catch (err) {
      console.log('Error! getting media, err: ', err.toString());
    }
    CURRENT_MEDIA_IDX++;
  }

  async function playLoop() {
    SCREEN_OBJ = null;
    CURRENT_MEDIA_IDX = 0;
    SHUFFLE_PLAYLIST = false;
    CURRENT_PLAYLIST_SETUP = [];

    while (SCREEN_STATUS) {
      try {
        if (!SCREEN_ID) {
          break;
        }
        const screenData = await getScreenByQuery({ screen_id: SCREEN_ID, app: 'client' });
        if (screenData.data.length === 0) {
          console.log('No screen with this id: ', SCREEN_ID);
          displayScreenNotAvailable();
          await sleep(10000);
          continue;
        }
        const screenDoc = screenData.data[0];
        SCREEN_OBJ = screenDoc;
        const screenStatus = SCREEN_OBJ.status;
        if (screenStatus === 'stopped' || screenStatus === 'paused') {
          if (screenStatus === 'stopped') {
            displayStoppedScreen();
          }
          await sleep(10000);
          continue;
        }
        const playlistId = screenDoc.playlist_id;
        if (!playlistId) {
          console.log('No playlist attached');
          displayNoPlaylistScreen();
          await sleep(10000);
          continue;
        }

        const playlistData = await getPlaylist(playlistId);
        if (playlistData.data.length === 0) {
          console.log('No playlist with this id: ', playlistId);
          return;
        }
        const playlistDoc = playlistData.data[0];
        PLAYLIST_OBJ = playlistDoc;

        const res = await playMedia(playlistDoc);
      } catch (err) {
        console.log('Error: ', err);
        await sleep(10000);
      }
    }
  }

  // start play loop
  function startPlayLoop() {
    SCREEN_STATUS = true;
    // openFullscreen();
    playLoop();
  }

  $('#btnFullScreen').click(() => {
    openFullscreen();
  });

  function keyEvent(e) {
    if (e.key === 'Escape') {
      if (FULLSCREEN_VIEW) {
        exitFullScreen();
      } else {
        // exitFullScreen();
      }
    }
  }

  function checkLoggedIn() {
    if (localStorage.getItem(CONST_SCREEN_ID) && localStorage.getItem(CONST_SCREEN_CODE)) {
      console.log('[Session] Screen is logged in.');
      return true;
    } else {
      window.location.replace('/app-login');
    }
    return false;
  }

  // check logged in
  if (checkLoggedIn()) {
    document.body.addEventListener('keydown', keyEvent);

    $(document).dblclick(function () {
      if (FULLSCREEN_VIEW) {
        exitFullScreen();
      }
    });

    SCREEN_ID = localStorage.getItem(CONST_SCREEN_ID);
    console.log('starting play loop');
    startPlayLoop();
  } else {
    console.log('Login failed');
  }

//= =================== END MIAN ===========================
});
