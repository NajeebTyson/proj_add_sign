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
  // ================== FUNCTIONS END ==========================

  // ================== MAIN ===================================
  hideMediaInfoSidebar();

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
});
