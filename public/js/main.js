/* eslint-env jquery, browser */
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
    $.post('/api/playlist', { playlist: { name: playlistName } })
      .done(function () {
        notifySuccess(`${playlistName}, playlist is created`);
      })
      .fail(function (err) {
        notifyDanger(err.responseJSON.error);
      });
    $playlistInput.val('');
    $('#addPlaylistModal').modal('toggle');
  });
});
