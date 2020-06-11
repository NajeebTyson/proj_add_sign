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
  // ================== FUNCTIONS ==============================
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
  function getPlaylistCard(playlist) {
    return `
      <div class="card">
        <div class="card-header" id="${playlist._id}">
            <h2 class="mb-0">
                <button class="btn btn-link float-left" type="button" data-toggle="collapse" data-target="#collapse_${playlist._id}" aria-expanded="true" aria-controls="collapse_${playlist._id}"> ${playlist.name} </button>
            </h2>
            <a class="btn btn-primary float-right btn-sm deletePlaylist" data-playlistid="${playlist._id}" href="#"><i class="fa fa-trash-o" aria-hidden="true"></i> &nbsp;Delete </a>
            <a class="btn btn-primary float-right btn-sm addMediaToPlaylist" data-playlistid="${playlist._id}" data-playlistname="${playlist.name}" href="#"  data-toggle="modal" data-target="#addMediaModal">
                <i class="fa fa-plus" aria-hidden="true"></i>
                 &nbsp;Add Media 
            </a>
        </div>
        <div id="collapse_${playlist._id}" class="collapse" aria-labelledby="${playlist._id}" data-parent="#accordionPlaylist">
            <div class="card-body">
                <div class="container-fluid media-list">
                    <div class="row">
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-light.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-moon.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-light.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-dark.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-moon.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-light.svg"> </div>
                        <div class="col-6 col-md-4 col-lg-2 p-0 media-list-item"> <img class="img-fluid d-block" src="https://static.pingendo.com/cover-bubble-light.svg"> </div>
                    </div>
                </div>
            </div>
        </div>
    </div>    
    `;
  }

  // display playlist
  function displayPlaylist() {
    const playlist = getPlaylist();
    playlist.then(function (data) {
      const $listPlaylist = $('#accordionPlaylist');
      $listPlaylist.html('');
      data.forEach(function (playlist) {
        $listPlaylist.append(getPlaylistCard(playlist));
      });
    }).catch(function (err) {
      notifyDanger(err.responseJSON.error);
    });
  }
  // ================== FUNCTIONS END ==========================

  // ================== MAIN ===================================
  const $playlistAccordion = $('#accordionPlaylist');
  const $mediaModal = $('#addMediaModal');
  const $titleMediaAddModal = $('#titleMediaAddModal');
  const $inputMediaFile = $('#inputMediaFile');
  const $uploadedFiles = $('#uploadedFiles');
  const $inputHiddenPlaylist = $('#inputHiddenPlaylist');

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
    }
  });
});
