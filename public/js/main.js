/* eslint-env jquery, browser */
/* eslint prefer-arrow-callback: 0 */
/* eslint func-names: 0 */
$(document).ready(() => {
  // notifications
  function notifyDanger(message) {
    $.notify({ message }, { type: 'danger' });
  }
  function notifyWarning(message) {
    $.notify({ message }, { type: 'warning' });
  }
  function notifyInfo(message) {
    $.notify({ message }, { type: 'info' });
  }
  function notifySuccess(message) {
    $.notify({ message }, { type: 'success' });
  }
  // ================== Variables ==============================
  const $playlistAccordion = $('#accordionPlaylist');
  const $titleMediaAddModal = $('#titleMediaAddModal');
  const $inputMediaFile = $('#inputMediaFile');
  const $uploadedFiles = $('#uploadedFiles');
  const $inputHiddenPlaylist = $('#inputHiddenPlaylist');
  const $mediaThumbnail = $('#mediaThumbnail');
  const $mediaInformation = $('#mediaInformation');
  const $mediaDeleteLocation = $('#mediaDeleteLocation');
  const $rightSideBar = $('#rightSideBar');
  const $btnAddScreen = $('#btnAddScreen');
  const $screenTable = $('#screenTable');
  const $inputScreenId = $('input[name ="screen_id"]');
  const $inputScreenName = $('input[name ="screen_name"]');
  const $inputScreenCode1 = $('input[name ="screen_code_1"]');
  const $inputScreenCode2 = $('input[name ="screen_code_2"]');
  const $switchScreenShuffle = $('#switchScreenShuffle');
  const $selectModalScreenPlaylistId = $('#selectModalScreenPlaylistId');
  const $btnModalAttachPlaylist = $('#btnModalAttachPlaylist');
  // ================== End Variables ==========================
  // ================== FUNCTIONS ==============================
  // bytes to readable data unit
  function bytesToStr(bytes_) {
    let res = '';
    const kbs = bytes_ / 1024;
    if (kbs > 1024) {
      const mbs = kbs / 1024;
      if (mbs > 1024) {
        res = `${(mbs / 1024).toFixed(2)} GB`;
      } else {
        res = `${mbs.toFixed(2)} MB`;
      }
    } else {
      res = `${kbs.toFixed(2)} KB`;
    }
    return res;
  }

  // add playlist
  async function addPlaylist(playlistName) {
    await $.post('/api/playlist', { playlist: { name: playlistName } })
      .done(function () {
        notifySuccess(`${playlistName}, playlist is created`);
      })
      .fail(function (err) {
        notifyDanger(err.responseJSON.error);
      });
  }

  // delete playlist
  async function deletePlaylist(query) {
    const params = $.param({ ...query });
    await $.ajax({
      url: `/api/playlist?${params}`,
      type: 'DELETE'
    })
      .done(function () {
        notifySuccess('playlist is deleted');
      })
      .fail(function (err) {
        notifyDanger(err.responseJSON.error);
      });
  }

  // get media
  function getMedia(query) {
    return $.get('/api/media', { ...query });
  }

  // get media by list of ids
  function getMediaByIds(ids) {
    return $.post('/api/media/ids', { media: { ids } });
  }

  // delete media
  function deleteMedia(query) {
    const params = $.param({ ...query });
    return $.ajax({
      url: `/api/media?${params}`,
      type: 'DELETE'
    });
  }

  // get playlist
  async function getPlaylist(query) {
    return new Promise(function (res, rej) {
      $.get('/api/playlist', { ...query })
        .done(function (data) {
          res(data.data);
        })
        .fail(function (err) {
          rej(err);
        });
    });
  }

  // get playlist card
  async function getPlaylistCard(playlist) {
    const finalHtml = ''
      + '<div class="card">'
      + `  <div class="card-header" id="${playlist._id}">`
      + '      <h2 class="mb-0">'
      + `         <button class="btn btn-link float-left" type="button" data-toggle="collapse" data-target="#collapse_${playlist._id}" aria-expanded="true" aria-controls="collapse_${playlist._id}"> ${playlist.name} </button>`
      + '      </h2>'
      + `      <a class="btn btn-danger float-right btn-sm deletePlaylist" data-playlistid="${playlist._id}" href="#"><i class="fa fa-trash-o" aria-hidden="true"></i> &nbsp;Delete </a>`
      + `      <a class="btn btn-primary float-right btn-sm addMediaToPlaylist" data-playlistid="${playlist._id}" data-playlistname="${playlist.name}" href="#"  data-toggle="modal" data-target="#addMediaModal">`
      + '          <i class="fa fa-plus" aria-hidden="true"></i>'
      + '           &nbsp;Add Media'
      + '      </a>'
      + '  </div>'
      + `  <div id="collapse_${playlist._id}" class="collapse" aria-labelledby="${playlist._id}" data-parent="#accordionPlaylist">`
      + '      <div class="card-body">'
      + '          <div class="container-fluid media-list">'
      + '              <div class="row">';
      // + '                  <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-light.svg"> </div>';
    const endingHtml = '</div></div></div></div></div> ';

    const mediaLength = playlist.media.length;
    let mediaHtml = '';
    if (mediaLength) {
      try {
        const mediaData = await getMediaByIds(playlist.media);
        mediaData.data.forEach(function (mediaItem) {
          let htm = `<div class="col-6 col-md-4 col-lg-2 p-0 media-list-item" data-mediaid=${mediaItem._id}>`;
          if (mediaItem.type === 'image') {
            htm += ` <img class="img-fluid d-block" src="/static/media/${mediaItem.saved_name}">`;
            htm += `<a href="#" class="JesterBox"><div id="${mediaItem._id}"><img src="/static/media/${mediaItem.saved_name}"></div>`;
          } else if (mediaItem.type === 'video') {
            htm += `<div class="embed-responsive embed-responsive-16by9" ><video src="/static/media/${mediaItem.saved_name}" class="embed-responsive-item"> Your browser does not support HTML5 video. </video></div>`;
            htm += '<i class="fa fa-play" aria-hidden="true"></i>';
          }
          htm += '</div>';
          mediaHtml += htm;
        });
        return finalHtml + mediaHtml + endingHtml;
      } catch (err) {
        mediaHtml = `Error: ${err}`;
      }
    } else {
      mediaHtml = '<p class="font-italic">No media</p>';
    }
    return finalHtml + mediaHtml + endingHtml;
  }

  // display playlist
  function displayPlaylist() {
    const playlist = getPlaylist();
    playlist.then(function (data) {
      const $listPlaylist = $('#accordionPlaylist');
      $listPlaylist.html('');
      data.forEach(async function (playlist) {
        $listPlaylist.append(await getPlaylistCard(playlist));
      });
    }).catch(function (err) {
      notifyDanger(err.responseJSON.error);
    });
  }

  // clean media info sidebar
  function hideMediaInfoSidebar() {
    $rightSideBar.addClass('d-none');
  }

  // display media info sidebar
  function showMediaInfoSidebar() {
    $rightSideBar.removeClass('d-none');
  }

  // add screen
  async function addScreen(screenData) {
    await $.post('/api/screen', { screen: screenData })
      .done(function () {
        notifySuccess(`${screenData.screenId}, screen is created`);
      })
      .fail(function (err) {
        notifyDanger(err.responseJSON.error);
      });
  }

  // delete screen
  function deleteScreen(query) {
    const params = $.param({ ...query });
    return $.ajax({
      url: `/api/screen?${params}`,
      type: 'DELETE'
    });
  }

  // delete screen
  // eslint-disable-next-line camelcase
  function attachPlaylistToScreen(screen_id, playlist_id) {
    return $.post('/api/screen/playlist', {
      screen: {
        screenId: screen_id,
        playlistId: playlist_id
      }
    });
  }

  // get screens
  function getScreens(query) {
    return new Promise(function (res, rej) {
      $.get('/api/screen', { ...query })
        .done(function (data) {
          res(data.data);
        })
        .fail(function (err) {
          rej(err);
        });
    });
  }

  // change screen control
  // eslint-disable-next-line camelcase
  function updateScreenControl(screen_id, control_status) {
    return $.ajax({
      url: '/api/screen/controls',
      type: 'PUT',
      data: {
        screen: {
          screenId: screen_id,
          controlStatus: control_status
        }
      }
    });
  }

  // change screen shuffle
  // eslint-disable-next-line camelcase
  function updateScreenShuffle(screen_id, shuffle_option) {
    return $.ajax({
      url: '/api/screen/shuffle',
      type: 'PUT',
      data: {
        screen: {
          screenId: screen_id,
          shuffle: shuffle_option
        }
      }
    });
  }

  // display screens
  function displayScreen() {
    const screens = getScreens();
    screens.then(function (data) {
      const controlPause = '<i class="fa fa-pause ml-2 cursor-pointer btn-screen-ctrl" data-control="paused" aria-hidden="true" title="Pause"></i>';
      const controlStop = '<i class="fa fa-stop ml-2 cursor-pointer btn-screen-ctrl" data-control="stopped" aria-hidden="true" title="Stop"></i>';
      const controlPlay = '<i class="fa fa-play ml-2 cursor-pointer btn-screen-ctrl" data-control="playing" aria-hidden="true" title="Play"></i>';
      $screenTable.html('');
      data.forEach(async function (screen) {
        let playlistName = '';
        if (screen.playlist_id) {
          try {
            const playlist = await getPlaylist({ _id: screen.playlist_id });
            if (playlist.length > 0) {
              playlistName = playlist[0].name;
            }
          } catch (e) {
            playlistName = '';
            notifyWarning(`Error getting playlist info, ${e}`);
          }
        }
        let attachmentHtml = '<i class="fa fa-random cursor-pointer btnScreenShuffle" data-shuffle="true" title="Shuffle screen media" aria-hidden="true"></i>';
        if (screen.shuffle) {
          attachmentHtml = '<i class="fa fa-sort-amount-asc cursor-pointer btnScreenShuffle" data-shuffle="false" title="Order screen media" aria-hidden="true"></i>';
        }

        let controlsHtml = controlPause + controlStop;
        if (screen.status === 'paused') {
          controlsHtml = controlPlay + controlStop;
        } else if (screen.status === 'stopped') {
          controlsHtml = controlPlay;
        }
        const screenHtml = `
        <tr data-screenid="${screen._id}" data-screenname="${screen.screen_name}">
            <td>${screen.screen_name}</td>
            <td><span class="font-italic">${playlistName}</span></td>
            <td>${controlsHtml}</td>
            <td>
                ${attachmentHtml}
                <i class="fa fa-bars ml-2 cursor-pointer btnScreenAttachPlaylist" data-toggle="modal"
                    data-target="#screenAttachPlaylistModal" aria-hidden="true" title="Attach playlist"></i>
                <i class="fa fa-trash-o ml-2 cursor-pointer btnDeleteScreen" title="Delete screen"></i>
            </td>
            <td><span class="badge badge-info">${screen.status}</span></td>
        </tr>
        `;
        $screenTable.append(screenHtml);
      });
    }).catch(function (err) {
      notifyDanger(err.responseJSON.error);
    });
  }
  // ================== FUNCTIONS END ==========================

  // ================== MAIN ===================================

  // accordian for playlist
  $('.sidebar-dropdown > a').click(function () {
    $('.sidebar-submenu').slideUp(200);
    if ($(this).parent().hasClass('active')) {
      $('.sidebar-dropdown').removeClass('active');
      $(this).parent().removeClass('active');
    } else {
      $('.sidebar-dropdown').removeClass('active');
      $(this).next('.sidebar-submenu').slideDown(200);
      $(this).parent().addClass('active');
    }
  });
  $('#close-sidebar').click(() => {
    $('.page-wrapper').removeClass('toggled');
  });
  $('#show-sidebar').click(() => {
    $('.page-wrapper').addClass('toggled');
  });

  // add playlist
  $('#btnAddPlaylist').click(function () {
    const $playlistInput = $('#inputPlaylistName');
    const playlistName = $playlistInput.val();
    if (playlistName === '') {
      notifyDanger('Invalid playlist name');
      return;
    }
    addPlaylist(playlistName);
    displayPlaylist();
    $playlistInput.val('');
    $('#addPlaylistModal').modal('toggle');
  });

  // display playlists
  displayPlaylist();
  displayScreen();

  // delete playlist
  $playlistAccordion.on('click', '.deletePlaylist', function () {
    const playlistId = $(this).data('playlistid');
    deletePlaylist({ _id: playlistId });
    displayPlaylist();
  });

  // event to attach playlist id to modal
  $playlistAccordion.on('click', '.addMediaToPlaylist', function () {
    const playlistId = $(this).data('playlistid');
    const playlistName = $(this).data('playlistname');
    $titleMediaAddModal.html(`Playlist: ${playlistName} | Add Media`);
    $inputHiddenPlaylist.val(playlistId);
    $inputMediaFile.val('');
    $uploadedFiles.html('');
  });

  // upload media
  $inputMediaFile.fileupload({
    dataType: 'json',
    multipart: true,
    add(e, data) {
      data.context = $('<p class="file-upload">')
        .append($('<a target="_blank">').text(data.files[0].name))
        .appendTo($uploadedFiles);
      data.submit();
    },
    progress(e, data) {
      const progress = parseInt((data.loaded / data.total) * 100, 10);
      data.context.css('background-position-x', `${100 - progress}%`);
    },
    done(e, data) {
      data.context
        .addClass('done');
      // .find('a')
      // .prop('href', data.result.files[0].url);
      displayPlaylist();
    }
  });

  // load media
  $playlistAccordion.on('click', '.media-list-item', async function () {
    const mediaId = $(this).data('mediaid');
    try {
      const data = await getMedia({ _id: mediaId });
      const media = data.data[0];
      let thumbnailHtml = '';
      if (media.type === 'image') {
        thumbnailHtml = `<a href="#${media._id}"><img class="img-fluid d-block" src="/static/media/${media.saved_name}" height="50px"></a>`;
      } else if (media.type === 'video') {
        thumbnailHtml = '<div class="embed-responsive embed-responsive-16by9">'
          + `<video src="/static/media/${media.saved_name}" class="embed-responsive-item" controls="controls"> Your browser does not support HTML5 video. </video>`
          + '</div>';
      } else {
        thumbnailHtml = '<h3>Unsupported content</h3>';
      }
      $mediaThumbnail.html(thumbnailHtml);
      const mediaInfoHtml = ''
        + `<a>Name: ${media.name}</a> <br>`
        + `<a>Type: ${media.type}</a> <br>`
        + `<a>Date: ${(new Date(media.createdAt)).toUTCString()}</a> <br>`
        + `<a>Size: ${bytesToStr(media.size)}</a> <br>`;
      $mediaInformation.html(mediaInfoHtml);
      $mediaDeleteLocation.html(`<a class="btn btn-danger btn-sm fa-pull-right" id="mediaDeleteBtn" data-mediaid="${media._id}" href="#"><i class="fa fa-trash-o" aria-hidden="true"></i> &nbsp;Delete </a>`);
      showMediaInfoSidebar();
    } catch (err) {
      $mediaThumbnail.html('<h3>Error! Unable to load content</h3>');
      $mediaInformation.html(`<a>Error: ${err}</a>`);
    }
  });

  // delete media
  $mediaDeleteLocation.on('click', '#mediaDeleteBtn', async function () {
    const mediaId = $(this).attr('data-mediaid');
    try {
      await deleteMedia({ _id: mediaId });
      displayPlaylist();
      hideMediaInfoSidebar();
    } catch (err) {
      notifyWarning(`Error deleting media: ${err}`);
    }
  });

  // add screen
  $btnAddScreen.click(function () {
    if (!$inputScreenId.val()) {
      notifyDanger('Empty screen id is not acceptable');
      return;
    }
    if (!$inputScreenName.val()) {
      notifyDanger('Empty screen name is not acceptable');
      return;
    }
    if (!$inputScreenCode1.val()) {
      notifyDanger('Empty screen code is not acceptable');
      return;
    }
    if ($inputScreenCode1.val() !== $inputScreenCode2.val()) {
      notifyDanger('Screen codes are not same');
      return;
    }
    addScreen({
      screenId: $inputScreenId.val(),
      screenName: $inputScreenName.val(),
      screenCode: $inputScreenCode1.val(),
      screenShuffle: $switchScreenShuffle.is(':checked')
    });
    $inputScreenId.val('');
    $inputScreenName.val('');
    $inputScreenCode1.val('');
    $inputScreenCode2.val('');
    $switchScreenShuffle.prop('checked', false);
    $('#addScreenModal').modal('toggle');
    displayScreen();
  });

  // delete screen
  $screenTable.on('click', '.btnDeleteScreen', async function () {
    const screenId = $(this).parent().parent().data('screenid');
    try {
      await deleteScreen({ _id: screenId });
      displayScreen();
    } catch (err) {
      notifyWarning(`Error deleting screen: ${err}`);
    }
  });

  // attach screen id to attach playlist modal
  $screenTable.on('click', '.btnScreenAttachPlaylist', function () {
    const screenId = $(this).parent().parent().data('screenid');
    const screenName = $(this).parent().parent().data('screenname');
    $selectModalScreenPlaylistId.attr('data-screenid', screenId);
    $('#modalHeaderSAP').html(`Attach playlist to screen: ${screenName}`);
    getPlaylist().then((function (data) {
      $selectModalScreenPlaylistId.html('');
      data.forEach(function (playlist) {
        $selectModalScreenPlaylistId.append(`<option value="${playlist._id}">${playlist.name}</option>`);
      });
    })).catch(function (err) {
      notifyDanger(err);
    });
  });

  // attach playlist to screen
  $btnModalAttachPlaylist.click(function () {
    const screenId = $selectModalScreenPlaylistId.attr('data-screenid');
    const playlistId = $selectModalScreenPlaylistId.find(':selected').val();
    attachPlaylistToScreen(screenId, playlistId).then(function () {
      notifySuccess('Playlist is attached to the screen');
    }).catch(function (err) {
      notifyDanger(`Error in playlist attachment, ${err}`);
    });
    $('#screenAttachPlaylistModal').modal('toggle');
    displayScreen();
  });

  // change screen control
  $screenTable.on('click', '.btn-screen-ctrl', function () {
    const controlStatus = $(this).attr('data-control');
    const screenId = $(this).parent().parent().data('screenid');
    updateScreenControl(screenId, controlStatus).then(function () {
      notifySuccess('Screen control option updated');
      displayScreen();
    }).catch(function () {
      notifyDanger('Error updating screen control');
    });
  });

  // change screen shuffle
  $screenTable.on('click', '.btnScreenShuffle', function () {
    const shuffle = $(this).attr('data-shuffle');
    const screenId = $(this).parent().parent().data('screenid');
    updateScreenShuffle(screenId, shuffle).then(function () {
      notifySuccess('Screen shuffle updated');
      displayScreen();
    }).catch(function () {
      notifyDanger('Error updating screen shuffle');
    });
  });
});
