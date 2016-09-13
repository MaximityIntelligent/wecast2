/*! sPlayer v1.0.1 b10170 | © Manar Kamel (manarkamel.github.io) */
// Global Variables | sPlayer Configuration
// ** Here you can define your own variables (JQuery Plugin Options like)
// ** Please read sPlayer Developer Guide, "Variables" Section.
// ** Note: Don't Remove any unwanted(Optional) variables, just make them undefiend
// ** By setting them false.
// ======================================================== //
var playerContainer = '#playerJS', // Required
    playList = '.songs', // Required
    playListsContainer = '.content', // Optional
    playBtn = '#playBtn', // Required
    pauseBtn = '#playBtn.nowplaying', // Required
    nextBtn = '.next-btn', // Optional
    prevBtn = '.prev-btn', // Optional
    songDuration = '.song-length', // Optional
    songCurrentTime = '.current-time', // Optional
    playerSlider = '#slider', // Optional
    playerSliderProgress = '.sliderBg', // Optional
    radioTime = '.channel-time', // Optional
    starBtn = '.saveit', // Optional
    downloadBtn = '.downloadit', // Optional
    currentLoopBtn = '.loop-btn', // Optional
    currentStarBtn = '.star-btn', // Optional
    currentDownloadBtn = '.cloud-btn', // Optional
    currentShareBtn = '.share-btn', // Optional
    currentShareLink = '.share-link', // Optional
    starredList = '.starred-list', // Optional
    noStarredList = '#nocontent', // Optional
    resultsList = '.results-list', // Optional
    noResultsList = '#noresults', // Optional
    importLocalFiles = 'input.getSongs', // Optional
    importDefaultArt = 'images/albums/albumart-blank.jpg', // Optional
    liveSearch = '#search', // Optional
    starredListStorage = true, // Optional
    importStorage = true, // Optional
    lastPlayedSongIdStorage = true; // Optional

// ======================================================== //