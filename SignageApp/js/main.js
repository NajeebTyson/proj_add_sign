$(document).ready(function() {
//	const server = 'http://192.168.10.7:8080';
	const server = 'https://signage-application.herokuapp.com';

	// constants
	const CONST_SCREEN_ID = "screenId";
	const CONST_SCREEN_CODE = "screenCode";
	const CONST_FULLSCREEN_STATUS = "fullScreenStatus";

	// global variables
	var SCREEN_ID = null;
	var SCREEN_OBJ = null;
	var CURRENT_MEDIA_IDX = 0;
	var SHUFFLE_PLAYLIST = false;
	var CURRENT_PLAYLIST_SETUP = [];
	var SCREEN_STATUS = false;
	var FULLSCREEN_VIEW = false;

	const $inputScreenId = $("#inputScreenId");
	const $inputScreenCode = $("#inputScreenCode");
	const $btnLogin = $("#btnLogin");
	const $loginFlash = $("#loginFlash");
	const $btnSignout = $("#btnSignout");
	const $loginPage = $("#loginPage");
	const $screenPage = $("#screenPage");
	const $monitorContent = $("#monitorContent");
	const $fullScreenPage = $("#fullScreenPage");
	
	
	
//==================== FUNCTIONS ==========================
	async function doLogin(screenId, screenCode) {
		try {
			const res = await $.post(`${server}/api/screen/login`, {screen: {screenId, screenCode}});
			console.log('Screen logged in. data: ', res);
			return true;
		} catch (err) {
			console.log('Error! ', err.toString());
			return false;
		}
	}

	async function getScreen(screenId) {
		return $.get(`${server}/api/screen`, {_id: screenId});
	}

	async function getScreenByQuery(query) {
		return $.get(`${server}/api/screen`, query);
	}

	async function getPlaylist(playlistId) {
		return $.get(`${server}/api/playlist`, {_id: playlistId});
	}

	async function getMedia(mediaId) {
		return $.get(`${server}/api/media`, {_id: mediaId});
	}

	function getHtmlMedia(media) {
		const mediaUrl = `${server}/static/media/${media.saved_name}`;
		let mediaHtml = '';
		if (media.type === 'image') {
			mediaHtml = `<img class="content-monitor d-block align-middle img-fluid" src="${mediaUrl}">`;
		} else if (media.type === 'video') {
			mediaHtml = `<video id="videoContent" class="content-monitor" autoplay><source src="${mediaUrl}" type="video/mp4">Does not support the video tag.</video>`;
			// mediaHtml = `<video class="content-monitor" src="${mediaUrl}" class="embed-responsive-item">Does not support HTML5 video. </video>`;
		}
		return mediaHtml;
	}

	// compare array element wise
	function arraysEqual(_arr1, _arr2) {
		if (!Array.isArray(_arr1) || ! Array.isArray(_arr2) || _arr1.length !== _arr2.length) {
			return false;
		}
		var arr1 = _arr1.concat().sort();
		var arr2 = _arr2.concat().sort();
	
		for (var i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i])
				return false;
		}
		return true;
	}

	// shuffle array
	function shuffle(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;
		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
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
		return new Promise(function(resolve) {
			return setTimeout(resolve, ms)
		});
	}

	// full screen
	function openFullscreen() {
//		var elem = document.getElementById("monitorContent");
//		elem.webkitRequestFullScreen();
		$fullScreenPage.removeClass("d-none");
		$loginPage.addClass("d-none");
		$screenPage.addClass("d-none");
		$monitorContent.html('');
		FULLSCREEN_VIEW = true;
	}

	// exit full screen
	function exitFullScreen() {
		// document.webkitCancelFullScreen();
		$fullScreenPage.addClass("d-none");
		$loginPage.addClass("d-none");
		$screenPage.removeClass("d-none");
		$fullScreenPage.html('');
		FULLSCREEN_VIEW = false;
	}

	// start play loop
	function startPlayLoop() {
		SCREEN_STATUS = true;
		playLoop();
	}

	// stop play loop
	function stopPlayLoop() {
		SCREEN_STATUS = false;
		$monitorContent.html('');
	}

	// login action
	async function loginAction(screenId, screenCode) {
		if (await doLogin(screenId, screenCode)) {
			$loginPage.addClass("d-none");
			$screenPage.removeClass("d-none");
			SCREEN_ID = screenId;
			localStorage.setItem(CONST_SCREEN_ID, screenId);
			localStorage.setItem(CONST_SCREEN_CODE, screenCode);
			return true;
		} else {
			$loginFlash.html('Login Failed').addClass('text-danger').fadeOut(5000, function() {
				$(this).html('');
			});
			return false;
		}
	}

	// clear monitor content
	function clearMonitorContent() {
		$monitorContent.html('');
	}
//==================== END FUNCTIONS ======================

//==================== MIAN ===============================
	// siging in
	$btnLogin.click(async function() {
		const screenId = $inputScreenId.val();
		const screenCode = $inputScreenCode.val();
		if(await loginAction(screenId, screenCode)) {
			openFullscreen();
			startPlayLoop();
		}
	});
	
	// singing out
	$btnSignout.click(function() {
		$screenPage.addClass("d-none");
		$loginPage.removeClass("d-none");
		$fullScreenPage.addClass("d-none");
		stopPlayLoop();
		localStorage.clear();
	});

	function setupPlaylist(playlist) {
		if (!arraysEqual(CURRENT_PLAYLIST_SETUP, playlist.media)) {
			CURRENT_PLAYLIST_SETUP = playlist.media;
			if(CURRENT_MEDIA_IDX >= CURRENT_PLAYLIST_SETUP) {
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

		const mediaId = CURRENT_PLAYLIST_SETUP[CURRENT_MEDIA_IDX];
		try {
			const media = await getMedia(mediaId);
			if(media.data.length === 0) {
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
				await sleep(SCREEN_OBJ.image_duration * 1000);
			} else if (CURRENT_MEDIA.type === 'video') {
				console.log('video is playing')
				await sleep(1000);
				let videoIsplaying = true;
				document.addEventListener('ended', function(e){
					console.log('ended event occurred')
					videoIsplaying = false;	
				}, true);
				while (videoIsplaying) {
					let vidHtml;
					if (FULLSCREEN_VIEW) {
						vidHtml = $fullScreenPage.html();
					} else {
						vidHtml = $monitorContent.html();
					}
					if (vidHtml === '') {
						document.removeEventListener('ended', function() {
							videoIsplaying = false;
						});
						break;
					}
					console.log('video, sleeping for 5')
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

		while(SCREEN_STATUS) {
			try {
				if (!SCREEN_ID) {
					break;
				}
				const screenData = await getScreenByQuery({screen_id: SCREEN_ID});

				if (screenData.data.length === 0) {
					console.log('No screen with this id: ', SCREEN_ID);
					return;
				}
				const screenDoc = screenData.data[0];
				SCREEN_OBJ = screenDoc;
				const screenStatus = SCREEN_OBJ.status;
				if(screenStatus === "stopped" || screenStatus === "paused") {
					if(screenStatus === "stopped") {
						clearMonitorContent();
					}
					await sleep(10000);
					continue;
				}
				const playlistId = screenDoc.playlist_id;
				if (!playlistId) {
					console.log('No playlist attached');
					return;
				}

				const playlistData = await getPlaylist(playlistId);
				if(playlistData.data.length === 0) {
					console.log('No playlist with this id: ', playlistId);
					return;
				}
				const playlistDoc = playlistData.data[0];
				PLAYLIST_OBJ = playlistDoc;
				
				const res = await playMedia(playlistDoc);
			} catch(err) {
				console.log('Error: ', err);
				await sleep(10000);
			};
		}
	}

	$('#btnFullScreen').click(function() {
		openFullscreen();
	});


	// auto Login
	async function checkAutoLogin() {
		if(localStorage.getItem(CONST_SCREEN_ID) && localStorage.getItem(CONST_SCREEN_CODE)) {
			const loginRes = await loginAction(localStorage.getItem(CONST_SCREEN_ID), localStorage.getItem(CONST_SCREEN_CODE));
			if (loginRes) {
				openFullscreen();
				startPlayLoop();
			}
		}
	}

	var backEvent = function(e) {
        if ( e.keyName == "back" ) {
			if(FULLSCREEN_VIEW) {
				exitFullScreen();
			} else {
				try {
					unregister();
				} catch( ex ) {
					unregister();
				}
			}
        }
    }
    
    // add eventListener for tizenhwkey (Back Button)
	document.addEventListener('tizenhwkey', backEvent);
	$(document).on('keydown', function(event) {
		if (event.key == "Escape") {
			if(FULLSCREEN_VIEW) {
				// backEvent(event)
			}
		}
		return true;
	});

	// check auto login
	checkAutoLogin();
//==================== END MIAN ===========================
});