/*! sPlayer v1.0.1 b10170 | © Manar Kamel (manarkamel.github.io) */
// Helpers
// ======================================================== //

// -- Converter to time (string.toMMSS())
String.prototype.toMMSS = function () {
    var sec_num = parseInt(this, 10);
    var minutes = Math.floor(sec_num / 60);
    var seconds = sec_num - (minutes * 60);

    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var time = minutes + ':' + seconds;
    return time;
};

// ======================================================== //
// Default Variables
// ======================================================== //

if (!playListsContainer) {
    playListsContainer = 'body'
}

// ======================================================== //


// sP (sPlayer Magic)
// ======================================================== //

var sP = {
    // -- Audio Element
    // ** I'm using HTMLAudioElement object
    // ** Which's ~60% Faster than createElement()
    // ** Check this test
    // ** https://jsperf.com/new-audio-vs-document-createelement-audio
    audio: new Audio(),

    // -- Play fn
    // ** sP.play(): play the current song
    // ** sP.play(someElement): play a new song
    // ** sP.play(someElement, 'radio'): play a new song but w/ radio method
    play: function (sElement, radio) {
        if (!sElement) {
            sP.audio.play();
            $(playList + ' li.wasplaying').removeClass('wasplaying');

        } else if (sElement) {
            sP.audio.src = $(sElement).attr('data-song');
            sP.audio.load();
            sP.audio.play();

            $(playList + ' li').removeClass('nowplaying wasplaying');
            $(sElement).addClass('nowplaying');
            if (currentLoopBtn) {
                $(currentLoopBtn).removeClass('islooped');
            }

            // -- Sync with the Bottom classes
            if (currentStarBtn && $(sElement).find(starBtn + '.isstarred').length) {
                $(currentStarBtn).addClass('isstarred');

            } else if (currentStarBtn && !$(sElement).find(starBtn + '.isstarred').length) {
                $(currentStarBtn).removeClass('isstarred');
            }
            if (currentDownloadBtn && $(sElement).find(downloadBtn + '.isdownloaded').length) {
                $(currentDownloadBtn).addClass('isdownloaded');

            } else if (currentDownloadBtn && !$(sElement).find(downloadBtn + '.isdownloaded').length) {
                $(currentDownloadBtn).removeClass('isdownloaded');
            }

            if (songDuration) {
                // Prevent NaN:NaN output
                if (sP.audio.duration != sP.audio.duration) {
                    $(songDuration).text('0:00');
                }
            }
            // -- Save the Current Playing SongID to Storage
            // ** Note: I'm telling it not to save last played local song
            if (lastPlayedSongIdStorage && $(sElement).not('[id^=sLID]').attr('id')) {
                var lastPlayedSongID = $(sElement).attr('id');
                localStorage.setItem('lastPlayedID', lastPlayedSongID)
            }
        }

        if (radio && radioTime) {
            sP.audio.addEventListener('timeupdate', function (d) {
                var currentSec = parseInt(sP.audio.currentTime, 10).toString(),
                    sCurrentDone = currentSec.toMMSS();
                $(radioTime).html(sCurrentDone);
            });
        }

        $(playBtn).addClass('nowplaying');

    },

    // -- Pause fn
    pause: function () {
        sP.audio.pause();
        $(pauseBtn).removeClass('nowplaying');
        $(playList + ' li.nowplaying').addClass('wasplaying');
    },

    // -- Next fn
    // ** We make sure that next play cant be called 
    // ** on the last child, because trust me it aint pretty
    // ** when we call sNext fn on the last child
    next: function () {
        if ($(playList + ' li.nowplaying:not(:last-child)').length) {
            var sElementNew = $(playList + ' li.nowplaying').next();
            sP.play(sElementNew)
        } else {
            return false;
        }
    },

    // -- Prev fn
    // ** This fn cant be called on the first child
    prev: function () {
        if ($(playList + ' li.nowplaying:not(:first-child)').length) {
            var sElementNew = $(playList + ' li.nowplaying').prev();
            sP.play(sElementNew)
        } else {
            return false;
        }
    },

    // -- Star fn
    // -- sStar(): Star the playing song
    // -- sStar(someElement): Star that element
    star: function (sElement) {
        var SongLi = '';
        if (!sElement) {
            SongLi = playList + ' li.nowplaying';
        } else if (sElement) {
            SongLi = sElement;
        }
        var SongLiData = $(SongLi).attr('id');
        var cloneSongLi = $('#' + SongLiData).clone();
        $(cloneSongLi).attr({
            'data-id': SongLiData,
            id: ''
        })
        $(starredList + ' ul').append(cloneSongLi);
        if (noStarredList) {
            $(noStarredList).addClass('passive');
        }

        if (currentStarBtn && $(SongLi).hasClass('nowplaying')) {
            $(currentStarBtn).addClass('isstarred');
        }

        $(starredList + ' li ' + starBtn).addClass('isstarred');
        $(SongLi).find(starBtn).addClass('isstarred');


        // -- Store Starred Songs IDs arrey for localStorage
        if (starredListStorage) {
            var starredSongsID = $(playList + ' li[id] ' + starBtn + '.isstarred').parents('li').map(function () {
                return this.id;
            }).get().join(',');
            localStorage.setItem('starredSongs', starredSongsID);
        }

    },

    // -- Unstar fn
    // ** sUnstar(): Unstar the playing song
    // ** sUnstar(someElement): Unstar that element
    unstar: function (sElement) {
        var SongLi = '';
        if (!sElement) {
            SongLi = playList + ' li.nowplaying';
        } else if (sElement) {
            SongLi = sElement;
        }

        var SongLiData = $(SongLi).attr('id') || $(SongLi).attr('data-id');
        $(starredList + ' li[data-id=' + SongLiData + ']').remove();
        $('#' + SongLiData).find(starBtn).removeClass('isstarred');
        if (noStarredList && $(starredList + ' li').length == 0) {
            $(noStarredList).removeClass('passive');
        }

        if (currentStarBtn && $(SongLi).hasClass('nowplaying')) {
            $(currentStarBtn).removeClass('isstarred');
        }

        $(SongLi).find(starBtn).removeClass('isstarred');

        // -- Store starred Songs IDs arrey for localStorage
        if (starredListStorage) {
            var starredSongsID = $(playList + ' li[id] ' + starBtn + '.isstarred').parents('li').map(function () {
                return this.id;
            }).get().join(',');
            localStorage.setItem('starredSongs', starredSongsID);
        }

    },

    // -- Live Search fn
    // ** Usage: 
    // ** $(input).keyup(function() {
    // **    var thisVal = $(this).val();
    // **    sP.search(thisVal)
    // ** })
    search: function (thisVal) {
        // -- Searching for all Songs Li that has ID only
        var searchableSongElements = '';
        if (starredList) {
            searchableSongElements = playList + ':not(' + starredList + ') li[id]';
        } else {
            searchableSongElements = playList + ' li[id]';
        }
        $(searchableSongElements).each(function () {
            if ($(this).text().search(new RegExp(thisVal, 'i')) < 0) {
                var idLi = $(this).attr('id');
                $(resultsList + ' li[data-id=' + idLi + ']').remove();

            } else {
                var idLi = $(this).attr('id'),
                    cloneLi = $(this).clone(),
                    dCloneLi = {};
                $(cloneLi).attr({
                    'data-id': idLi,
                    id: ''
                });

                $(resultsList + ' ul').append(cloneLi);
                // -- Removing duplicated results
                $(resultsList + ' li').each(function () {
                    var thisId = $(this).attr('data-id');
                    if (dCloneLi[thisId]) {
                        $(this).remove();
                    } else {
                        dCloneLi[thisId] = 'true';
                    }
                });

            }

        });
        // -- Show "No results" when resLi = 1
        if (noResultsList && $(resultsList + ' li').length == 0) {
            $(noResultsList).show();
        } else if (noResultsList && $(resultsList + ' li').length > 0) {
            $(noResultsList).hide();
        }
    },

    // -- Import Local Files
    // ** Usage:
    // ** function sPimportBeta(song, tags, url, id, art) { doSomething(tags) }
    import: function (queue, i) {
        // -- Passing songs objects to ID3 js
        // ** Note: there's also parseURL fn but only for URLs
        // ** in this case we are dealing with file objects
        ID3v2.parseFile(queue[i], function (tags) {
            //console.log(tags);

            // --  Creating Song Blob URL
            var url;
            if (window.createObjectURL) {
                url = window.createObjectURL(queue[i])
            } else if (window.createBlobURL) {
                url = window.createBlobURL(queue[i])
            } else if (window.URL && window.URL.createObjectURL) {
                url = window.URL.createObjectURL(queue[i])
            } else if (window.webkitURL && window.webkitURL.createObjectURL) {
                url = window.webkitURL.createObjectURL(queue[i])
            }

            // --  Creating Song ID
            var id = 'sLID' + i;

            // -- smartCoverArt (art)
            // -- smartCoverArt Pirtioty = Embedded image then SearchAPI then default cover
            // ** Note: I'm checking also for image Description if its empty
            // ** because if it has some weird characters
            // ** the dataURL would be disrupted (non functional)
            // ** I think this is ID3.js bug.
            // ** I tasted hunderends of songs,
            // ** the songs downloaded from noisetrade.com seems to only have this issues
            // ** Thats not a big problem, the art would fallback to the defaultArt

            // ** Note: I'm checking also for tags.pictures.length,
            // ** to prevent an error
            var art = importDefaultArt || '';
            if (tags.pictures.length > 0 && tags.pictures[0].dataURL && tags.pictures[0].Description == "") {
                art = tags.pictures[0].dataURL;
                return sPimportBeta(queue[i], tags, url, id, art)
            } else if (tags.Album && tags.Artist) {
                var tagsAlbum = tags.Album.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''),
                    tagsArtist = tags.Artist.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, ''),
                    crSearchAPI = 'https://api.spotify.com/v1/search?q=album:' + tagsAlbum + '%20artist:' + tagsArtist + '&type=album';
                var searchAPI = crSearchAPI.replace(/ /g, '%20');
                // -- Get SpotifyAPI and Return fn
                $.getJSON(searchAPI, function (data) {
                    $.each(data, function (key, value) {
                        if (value.items[0]) {
                            art = value.items[0].images[1].url;
                        }
                        return sPimportBeta(queue[i], tags, url, id, art)
                    });
                }).fail(function () {
                    return sPimportBeta(queue[i], tags, url, id, art)
                });
            } else {
                return sPimportBeta(queue[i], tags, url, id, art)
            }


        });
    },
    share: function (callback) {
        var urlHref = window.location.href,
            hasShareParm = urlHref.indexOf('?share='),
            hasSongId = urlHref.substr(hasShareParm + 7);
        if (hasShareParm > -1 && $('#' + hasSongId).length) {
            return callback(hasSongId)
        }
    },
    lastPlayed: function (callback) {
        // -- Last Played Song ID
        var lastPlayedID = localStorage.getItem('lastPlayedID');
        var urlHref = window.location.href,
            hasShareParm = urlHref.indexOf('?share='),
            hasSongId = urlHref.substr(hasShareParm + 7);

        if (lastPlayedID && hasShareParm == -1) {
            return callback(lastPlayedID)
        }

    },
    clear: function (clearKey) {
        if (clearKey == 'starredListStorage') {
            localStorage.removeItem('starredSongs');
        } else if (clearKey == 'importStorage') {
            localforage.removeItem('selectedFiles');
            $(importLocalFiles).wrap('<form>').closest('form').get(0).reset();
            $(importLocalFiles).unwrap();
        }
    }
}

// ======================================================== //
// Play fn
// ======================================================== //

$(playerContainer).on('click', playBtn, function() {
    sP.play()
});

// ======================================================== //
// Pause fn
// ======================================================== //

$(playerContainer).on('click', pauseBtn, function(){
    sP.pause()
});

// ======================================================== //
// Playlist fn
// ======================================================== //

// ** (This method is better than if(..hasClass etc) doSomething etc..)
$(playListsContainer).on('click', playList + ' li.nowplaying.wasplaying', function(){
    sP.play()
});
$(playListsContainer).on('click', playList + ' li.nowplaying:not(.wasplaying)', function() {
    sP.pause();
});
$(playListsContainer).on('click', playList + ' li:not(.nowplaying):not(.wasplaying)', function () {
    sP.play(this);
});

// ======================================================== //
// Next fn
// ======================================================== //

if (nextBtn) {
    $(nextBtn).click(sP.next);
}

// ======================================================== //
// Prev fn
// ======================================================== //

if (prevBtn) {
    $(prevBtn).click(sP.prev);
}

// ======================================================== //
// Time: Song Duration and Song CurrentTime
// ======================================================== //

if (songDuration || songCurrentTime) {
    sP.audio.addEventListener('loadedmetadata', function (d) {
        var durationSec = parseInt(sP.audio.duration, 10).toString(),
            sDurationDone = durationSec.toMMSS(),
            currentSec = parseInt(sP.audio.currentTime, 10).toString(),
            sCurrentDone = currentSec.toMMSS();
        if (songDuration) {
            // Prevent NaN:NaN output
            if (sP.audio.duration != sP.audio.duration) {
                $(songDuration).text('0:00');
            } else {
                $(songDuration).text(sDurationDone);
            }
        }

        if (songCurrentTime) {
            $(songCurrentTime).text(sCurrentDone);
        }
    });
}

// ======================================================== //
// Slider
// ========================================================= //

// -- Slider Change
if (playerSlider) {
    $(playerSlider).on("change", function () {
        sP.audio.currentTime = $(playerSlider).val()
        sP.audio.play();
        $(playBtn).addClass('nowplaying');
        $(playList + ' li.wasplaying').removeClass('wasplaying');
    });
}

// -- Slider Timeupdate
if (playerSlider || playerSliderProgress || songCurrentTime) {
    sP.audio.addEventListener('timeupdate', function (s) {
        if (playerSlider) {
            $(playerSlider).attr('max', sP.audio.duration).attr('value', sP.audio.currentTime);
        }

        var currentSec = parseInt(sP.audio.currentTime, 10).toString(),
            sCurrentDone = currentSec.toMMSS();

        if (playerSliderProgress) {
            var sliderBgPercent = (sP.audio.currentTime * 100) / sP.audio.duration + '%';
            $(playerSliderProgress).css('width', sliderBgPercent);
        }

        if (songCurrentTime) {
            $(songCurrentTime).text(sCurrentDone)
        }
    });
}
// ========================================================= //
// Loop
// ======================================================== //

if (currentLoopBtn) {
    $(currentLoopBtn).click(function () {
        $(this).toggleClass('islooped');
        function loopTrue() {
            if ($(currentLoopBtn + '.islooped').length) {
                sP.audio.play();
                if (playerSlider) {
                    $(playerSlider).val(sP.audio.currentTime);
                }
                $(playBtn).addClass('nowplaying');
                $(playList + ' li.nowplaying').removeClass('wasplaying');
            } else {
                return false
            }

        };
        sP.audio.addEventListener('ended', loopTrue);
    });
}

// -- Audio on End [No Loop]
sP.audio.addEventListener('ended', function () {
    if(!currentLoopBtn && $(playList + ' li.nowplaying:not(:last-child)').length) {
        sP.next()
    } else if (currentLoopBtn && $(playList + ' li.nowplaying:not(:last-child)').length && $(currentLoopBtn + ':not(.islooped)').length) {
        sP.next()
    } else {
        sP.pause()
    }
});
// ======================================================== //
// Star/Save 
// ======================================================== //

// -- Star/Save btn Function in current
if (currentStarBtn) {
    $(currentStarBtn).click(function (b) {
        // -- Star or Unstar 
        if (!$(this).hasClass('isstarred')) {
            sP.star()
        } else {
            sP.unstar()
        }
    });
}

// -- Star/Save btn Function in playlist
if (starBtn) {
    $(playListsContainer).on('click', starBtn, function (e) {
        // -- stopPropagation / preventDefault
        e.stopPropagation();
        e.preventDefault();
        var SongLi = $(this).parent();
        if (!$(this).hasClass('isstarred')) {
            sP.star(SongLi)
        } else {
            sP.unstar(SongLi)
        }
    });
}

// ======================================================== //
// Download
// ======================================================== //

// -- Download/Cloud btn Function in current
if (currentDownloadBtn) {
    $(currentDownloadBtn).click(function (b) {
        var getNPDown = $(playList + ' li.nowplaying ' + downloadBtn),
            getNPDownA = getNPDown.children(),
            getNPDownAH = getNPDownA.attr('href');
        $(this).toggleClass('isdownloaded');
        getNPDown.toggleClass('isdownloaded');
        $(this).children().attr('href', getNPDownAH)
    });
}

// -- Download/Cloud btn Function in playlist
if (downloadBtn) {
    $(playListsContainer).on('click', downloadBtn, function (e) {
        // -- stopPropagation
        e.stopPropagation();
        $(this).toggleClass('isdownloaded');
        // -- Sync with the bottom player classes
        var SongLi = $(this).parent();
        if ($(this).hasClass('isdownloaded')) {
            if (currentDownloadBtn && $(SongLi).hasClass('nowplaying')) {
                $(currentDownloadBtn).addClass('isdownloaded');
            }
        } else {
            if (currentDownloadBtn && $(SongLi).hasClass('nowplaying')) {
                $(currentDownloadBtn).removeClass('isdownloaded');
            }
        }
    });
}

// ======================================================== //
// Share
// ========================================================= //

// -- Create Share Link by Click on share Btn
if (currentShareBtn && currentShareLink) {
    $(currentShareBtn).click(function () {
        var shareSongId = $(playList + ' li.nowplaying').attr('id'),
            locationHr = window.location.href.split('?share=')[0],
            shareLink = locationHr + '?share=' + shareSongId;

        $(currentShareLink).text(shareLink);
    });
}

// ========================================================= //
// Live Search
// ======================================================== //

if(liveSearch) {
    $(liveSearch).keyup(function () {
        var thisVal = $(this).val();
        sP.search(thisVal)
    })
}

// ======================================================== //
// ID3V2
// ======================================================== //

// -- ID3 Tags Reader Helepers
var fileSlice = function(file, start, length) {
    if (file.mozSlice) return file.mozSlice(start, start + length);
    if (file.webkitSlice) return file.webkitSlice(start, start + length);
    if (file.slice) return file.slice(start, length);
}

// -- ID3 Tags Reader Magic
var ID3v2 = {
    parseStream: function (stream, onComplete) {
        var PICTURE_TYPES = {
            "0": "Other",
            "1": "32x32 pixels 'file icon' (PNG only)",
            "2": "Other file icon",
            "3": "Cover (front)",
            "4": "Cover (back)",
            "5": "Leaflet page",
            "6": "Media (e.g. lable side of CD)",
            "7": "Lead artist/lead performer/soloist",
            "8": "Artist/performer",
            "9": "Conductor",
            "A": "Band/Orchestra",
            "B": "Composer",
            "C": "Lyricist/text writer",
            "D": "Recording Location",
            "E": "During recording",
            "F": "During performance",
            "10": "Movie/video screen capture",
            "11": "A bright coloured fish", //<--- WTF?
            "12": "Illustration",
            "13": "Band/artist logotype",
            "14": "Publisher/Studio logotype",
        }

        // -- from: http://bitbucket.org/moumar/ruby-mp3info/src/tip/lib/mp3info/id3v2.rb
        var TAGS = {
            "AENC": "Audio encryption",
            "APIC": "Attached picture",
            "COMM": "Comments",
            "COMR": "Commercial frame",
            "ENCR": "Encryption method registration",
            "EQUA": "Equalization",
            "ETCO": "Event timing codes",
            "GEOB": "General encapsulated object",
            "GRID": "Group identification registration",
            "IPLS": "Involved people list",
            "LINK": "Linked information",
            "MCDI": "Music CD identifier",
            "MLLT": "MPEG location lookup table",
            "OWNE": "Ownership frame",
            "PRIV": "Private frame",
            "PCNT": "Play counter",
            "POPM": "Popularimeter",
            "POSS": "Position synchronisation frame",
            "RBUF": "Recommended buffer size",
            "RVAD": "Relative volume adjustment",
            "RVRB": "Reverb",
            "SYLT": "Synchronized lyric/text",
            "SYTC": "Synchronized tempo codes",
            "TALB": "Album",
            "TBPM": "BPM",
            "TCOM": "Composer",
            "TCON": "Genre",
            "TCOP": "Copyright message",
            "TDAT": "Date",
            "TDLY": "Playlist delay",
            "TENC": "Encoded by",
            "TEXT": "Lyricist",
            "TFLT": "File type",
            "TIME": "Time",
            "TIT1": "Content group description",
            "TIT2": "Title",
            "TIT3": "Subtitle",
            "TKEY": "Initial key",
            "TLAN": "Language(s)",
            "TLEN": "Length",
            "TMED": "Media type",
            "TOAL": "Original album",
            "TOFN": "Original filename",
            "TOLY": "Original lyricist",
            "TOPE": "Original artist",
            "TORY": "Original release year",
            "TOWN": "File owner",
            "TPE1": "Artist",
            "TPE2": "Band",
            "TPE3": "Conductor",
            "TPE4": "Interpreted, remixed, or otherwise modified by",
            "TPOS": "Part of a set",
            "TPUB": "Publisher",
            "TRCK": "Track number",
            "TRDA": "Recording dates",
            "TRSN": "Internet radio station name",
            "TRSO": "Internet radio station owner",
            "TSIZ": "Size",
            "TSRC": "ISRC (international standard recording code)",
            "TSSE": "Software/Hardware and settings used for encoding",
            "TYER": "Year",
            "TXXX": "User defined text information frame",
            "UFID": "Unique file identifier",
            "USER": "Terms of use",
            "USLT": "Unsychronized lyric/text transcription",
            "WCOM": "Commercial information",
            "WCOP": "Copyright/Legal information",
            "WOAF": "Official audio file webpage",
            "WOAR": "Official artist/performer webpage",
            "WOAS": "Official audio source webpage",
            "WORS": "Official internet radio station homepage",
            "WPAY": "Payment",
            "WPUB": "Publishers official webpage",
            "WXXX": "User defined URL link frame"
        };

        var TAG_MAPPING_2_2_to_2_3 = {
            "BUF": "RBUF",
            "COM": "COMM",
            "CRA": "AENC",
            "EQU": "EQUA",
            "ETC": "ETCO",
            "GEO": "GEOB",
            "MCI": "MCDI",
            "MLL": "MLLT",
            "PIC": "APIC",
            "POP": "POPM",
            "REV": "RVRB",
            "RVA": "RVAD",
            "SLT": "SYLT",
            "STC": "SYTC",
            "TAL": "TALB",
            "TBP": "TBPM",
            "TCM": "TCOM",
            "TCO": "TCON",
            "TCR": "TCOP",
            "TDA": "TDAT",
            "TDY": "TDLY",
            "TEN": "TENC",
            "TFT": "TFLT",
            "TIM": "TIME",
            "TKE": "TKEY",
            "TLA": "TLAN",
            "TLE": "TLEN",
            "TMT": "TMED",
            "TOA": "TOPE",
            "TOF": "TOFN",
            "TOL": "TOLY",
            "TOR": "TORY",
            "TOT": "TOAL",
            "TP1": "TPE1",
            "TP2": "TPE2",
            "TP3": "TPE3",
            "TP4": "TPE4",
            "TPA": "TPOS",
            "TPB": "TPUB",
            "TRC": "TSRC",
            "TRD": "TRDA",
            "TRK": "TRCK",
            "TSI": "TSIZ",
            "TSS": "TSSE",
            "TT1": "TIT1",
            "TT2": "TIT2",
            "TT3": "TIT3",
            "TXT": "TEXT",
            "TXX": "TXXX",
            "TYE": "TYER",
            "UFI": "UFID",
            "ULT": "USLT",
            "WAF": "WOAF",
            "WAR": "WOAR",
            "WAS": "WOAS",
            "WCM": "WCOM",
            "WCP": "WCOP",
            "WPB": "WPB",
            "WXX": "WXXX"
        };

        // -- pulled from http://www.id3.org/id3v2-00 and changed with a simple replace
        // ** probably should be an array instead, but thats harder to convert
        var ID3_2_GENRES = {
            "0": "Blues",
            "1": "Classic Rock",
            "2": "Country",
            "3": "Dance",
            "4": "Disco",
            "5": "Funk",
            "6": "Grunge",
            "7": "Hip-Hop",
            "8": "Jazz",
            "9": "Metal",
            "10": "New Age",
            "11": "Oldies",
            "12": "Other",
            "13": "Pop",
            "14": "R&B",
            "15": "Rap",
            "16": "Reggae",
            "17": "Rock",
            "18": "Techno",
            "19": "Industrial",
            "20": "Alternative",
            "21": "Ska",
            "22": "Death Metal",
            "23": "Pranks",
            "24": "Soundtrack",
            "25": "Euro-Techno",
            "26": "Ambient",
            "27": "Trip-Hop",
            "28": "Vocal",
            "29": "Jazz+Funk",
            "30": "Fusion",
            "31": "Trance",
            "32": "Classical",
            "33": "Instrumental",
            "34": "Acid",
            "35": "House",
            "36": "Game",
            "37": "Sound Clip",
            "38": "Gospel",
            "39": "Noise",
            "40": "AlternRock",
            "41": "Bass",
            "42": "Soul",
            "43": "Punk",
            "44": "Space",
            "45": "Meditative",
            "46": "Instrumental Pop",
            "47": "Instrumental Rock",
            "48": "Ethnic",
            "49": "Gothic",
            "50": "Darkwave",
            "51": "Techno-Industrial",
            "52": "Electronic",
            "53": "Pop-Folk",
            "54": "Eurodance",
            "55": "Dream",
            "56": "Southern Rock",
            "57": "Comedy",
            "58": "Cult",
            "59": "Gangsta",
            "60": "Top 40",
            "61": "Christian Rap",
            "62": "Pop/Funk",
            "63": "Jungle",
            "64": "Native American",
            "65": "Cabaret",
            "66": "New Wave",
            "67": "Psychadelic",
            "68": "Rave",
            "69": "Showtunes",
            "70": "Trailer",
            "71": "Lo-Fi",
            "72": "Tribal",
            "73": "Acid Punk",
            "74": "Acid Jazz",
            "75": "Polka",
            "76": "Retro",
            "77": "Musical",
            "78": "Rock & Roll",
            "79": "Hard Rock",
            "80": "Folk",
            "81": "Folk-Rock",
            "82": "National Folk",
            "83": "Swing",
            "84": "Fast Fusion",
            "85": "Bebob",
            "86": "Latin",
            "87": "Revival",
            "88": "Celtic",
            "89": "Bluegrass",
            "90": "Avantgarde",
            "91": "Gothic Rock",
            "92": "Progressive Rock",
            "93": "Psychedelic Rock",
            "94": "Symphonic Rock",
            "95": "Slow Rock",
            "96": "Big Band",
            "97": "Chorus",
            "98": "Easy Listening",
            "99": "Acoustic",
            "100": "Humour",
            "101": "Speech",
            "102": "Chanson",
            "103": "Opera",
            "104": "Chamber Music",
            "105": "Sonata",
            "106": "Symphony",
            "107": "Booty Bass",
            "108": "Primus",
            "109": "Porn Groove",
            "110": "Satire",
            "111": "Slow Jam",
            "112": "Club",
            "113": "Tango",
            "114": "Samba",
            "115": "Folklore",
            "116": "Ballad",
            "117": "Power Ballad",
            "118": "Rhythmic Soul",
            "119": "Freestyle",
            "120": "Duet",
            "121": "Punk Rock",
            "122": "Drum Solo",
            "123": "A capella",
            "124": "Euro-House",
            "125": "Dance Hall"
        };

        var tag = {
            pictures: []
        };


        var max_size = Infinity;

        function read(bytes, callback) {
            stream(bytes, callback, max_size);
        }


        function encode_64(input) {
            var output = "",
                i = 0,
                l = input.length,
                key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            while (i < l) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) enc3 = enc4 = 64;
                else if (isNaN(chr3)) enc4 = 64;
                output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
            }
            return output;
        }



        function parseDuration(ms) {
            var msec = parseInt(cleanText(ms)) //leading nulls screw up parseInt
            var secs = Math.floor(msec / 1000);
            var mins = Math.floor(secs / 60);
            var hours = Math.floor(mins / 60);
            var days = Math.floor(hours / 24);

            return {
                milliseconds: msec % 1000,
                seconds: secs % 60,
                minutes: mins % 60,
                hours: hours % 24,
                days: days
            };
        }


        function pad(num) {
            var arr = num.toString(2);
            return (new Array(8 - arr.length + 1)).join('0') + arr;
        }

        function arr2int(data) {
            if (data.length == 4) {
                if (tag.revision > 3) {
                    var size = data[0] << 0x15;
                    size += data[1] << 14;
                    size += data[2] << 7;
                    size += data[3];
                } else {
                    var size = data[0] << 24;
                    size += data[1] << 16;
                    size += data[2] << 8;
                    size += data[3];
                }
            } else {
                var size = data[0] << 16;
                size += data[1] << 8;
                size += data[2];
            }
            return size;
        }

        function parseImage(str) {
            var TextEncoding = str.charCodeAt(0);
            str = str.substr(1);
            var MimeTypePos = str.indexOf('\0');
            var MimeType = str.substr(0, MimeTypePos);
            str = str.substr(MimeTypePos + 1);
            var PictureType = str.charCodeAt(0);
            var TextPictureType = PICTURE_TYPES[PictureType.toString(16).toUpperCase()];
            str = str.substr(1);
            var DescriptionPos = str.indexOf('\0');
            var Description = str.substr(0, DescriptionPos);
            str = str.substr(DescriptionPos + 1);
            var PictureData = str;
            var Magic = PictureData.split('').map(function (e) {
                return String.fromCharCode(e.charCodeAt(0) & 0xff)
            }).join('');
            return {
                dataURL: 'data:' + MimeType + ';base64,' + encode_64(Magic),
                PictureType: TextPictureType,
                Description: Description,
                MimeType: MimeType
            };
        }

        function parseImage2(str) {
            var TextEncoding = str.charCodeAt(0);
            str = str.substr(1);
            var Type = str.substr(0, 3);
            str = str.substr(3);

            var PictureType = str.charCodeAt(0);
            var TextPictureType = PICTURE_TYPES[PictureType.toString(16).toUpperCase()];

            str = str.substr(1);
            var DescriptionPos = str.indexOf('\0');
            var Description = str.substr(0, DescriptionPos);
            str = str.substr(DescriptionPos + 1);
            var PictureData = str;
            var Magic = PictureData.split('').map(function (e) {
                return String.fromCharCode(e.charCodeAt(0) & 0xff)
            }).join('');
            return {
                dataURL: 'data:img/' + Type + ';base64,' + encode_64(Magic),
                PictureType: TextPictureType,
                Description: Description,
                MimeType: MimeType
            };
        }

        var TAG_HANDLERS = {
            "APIC": function (size, s, a) {
                tag.pictures.push(parseImage(s));
            },
            "PIC": function (size, s, a) {
                tag.pictures.push(parseImage2(s));
            },
            "TLEN": function (size, s, a) {
                tag.Length = parseDuration(s);
            },
            "TCON": function (size, s, a) {
                s = cleanText(s);
                if (/\([0-9]+\)/.test(s)) {
                    var genre = ID3_2_GENRES[parseInt(s.replace(/[\(\)]/g, ''))]
                } else {
                    var genre = s;
                }
                tag.Genre = genre;
            }
        };

        function read_frame() {
            if (tag.revision < 3) {
                read(3, function (frame_id) {
                    //console.log(frame_id)
                    if (/[A-Z0-9]{3}/.test(frame_id)) {
                        var new_frame_id = TAG_MAPPING_2_2_to_2_3[frame_id.substr(0, 3)];
                        read_frame2(frame_id, new_frame_id);
                    } else {
                        onComplete(tag);
                        return;
                    }
                })
            } else {
                read(4, function (frame_id) {
                    //console.log(frame_id)
                    if (/[A-Z0-9]{4}/.test(frame_id)) {
                        read_frame3(frame_id);
                    } else {
                        onComplete(tag);
                        return;
                    }
                })
            }
        }


        function cleanText(str) {
            if (str.indexOf('http://') != 0) {
                var TextEncoding = str.charCodeAt(0);
                str = str.substr(1);
            }
            return str.replace(/[^A-Za-z0-9\(\)\{\}\[\]\!\@\#\$\%\^\&\* \/\"\'\;\>\<\?\,\~\`\.\n\t]/g, '');
        }


        function read_frame3(frame_id) {
            read(4, function (s, size) {
                var intsize = arr2int(size);
                read(2, function (s, flags) {
                    flags = pad(flags[0]).concat(pad(flags[1]));
                    read(intsize, function (s, a) {
                        if (typeof TAG_HANDLERS[frame_id] == 'function') {
                            TAG_HANDLERS[frame_id](intsize, s, a);
                        } else if (TAGS[frame_id]) {
                            tag[TAGS[frame_id]] = (tag[TAGS[frame_id]] || '') + cleanText(s)
                        } else {
                            tag[frame_id] = cleanText(s)
                        }
                        read_frame();
                    })
                })
            })
        }

        function read_frame2(v2ID, frame_id) {
            read(3, function (s, size) {
                var intsize = arr2int(size);
                read(intsize, function (s, a) {
                    if (typeof TAG_HANDLERS[v2ID] == 'function') {
                        TAG_HANDLERS[v2ID](intsize, s, a);
                    } else if (typeof TAG_HANDLERS[frame_id] == 'function') {
                        TAG_HANDLERS[frame_id](intsize, s, a);
                    } else if (TAGS[frame_id]) {
                        tag[TAGS[frame_id]] = (tag[TAGS[frame_id]] || '') + cleanText(s)
                    } else {
                        tag[frame_id] = cleanText(s)
                    }
                    //console.log(tag)
                    read_frame();
                })
            })
        }


        read(3, function (header) {
            if (header == "ID3") {
                read(2, function (s, version) {
                    tag.version = "ID3v2." + version[0] + '.' + version[1];
                    tag.revision = version[0];
                    //console.log('version',tag.version);
                    read(1, function (s, flags) {
                        //todo: parse flags
                        flags = pad(flags[0]);
                        read(4, function (s, size) {
                            max_size = arr2int(size);
                            read(0, function () {}); //signal max
                            read_frame()
                        })
                    })
                })
            } else {
                onComplete(tag);
                return false; //no header found
            }
        })
        return tag;
    },

    parseURL: function (url, onComplete) {
        var xhr = new XMLHttpRequest();
        xhr.open('get', url, true);
        xhr.overrideMimeType('text/plain; charset=x-user-defined');

        var pos = 0,
            bits_required = 0,
            handle = function () {},
            maxdata = Infinity;

        function read(bytes, callback, newmax) {
            bits_required = bytes;
            handle = callback;
            maxdata = newmax;
            if (bytes == 0) callback('', []);
        }
        var responseText = '';
        (function () {
            if (xhr.responseText) {
                responseText = xhr.responseText;
            }
            if (xhr.responseText.length > maxdata) xhr.abort();

            if (responseText.length > pos + bits_required && bits_required) {
                var data = responseText.substr(pos, bits_required);
                var arrdata = data.split('').map(function (e) {
                    return e.charCodeAt(0) & 0xff
                });
                pos += bits_required;
                bits_required = 0;
                if (handle(data, arrdata) === false) {
                    xhr.abort();
                    return;
                }
            }
            setTimeout(arguments.callee, 0);
        })()
        xhr.send(null);
        return [xhr, ID3v2.parseStream(read, onComplete)];
    },
    parseFile: function (file, onComplete) {

        var reader = new FileReader();

        var pos = 0,
            bits_required = 0,
            handle = function () {},
            maxdata = Infinity;

        function read(bytes, callback, newmax) {
            bits_required = bytes;
            handle = callback;
            maxdata = newmax;
            if (bytes == 0) callback('', []);
        }
        var responseText = '';
        reader.onload = function () {
            responseText = reader.result;
        };

        (function () {

            if (responseText.length > pos + bits_required && bits_required) {
                var data = responseText.substr(pos, bits_required);
                var arrdata = data.split('').map(function (e) {
                    return e.charCodeAt(0) & 0xff
                });
                pos += bits_required;
                bits_required = 0;
                if (handle(data, arrdata) === false) {
                    return;
                }
            }
            setTimeout(arguments.callee, 0);
        })()
        reader.readAsBinaryString(fileSlice(file, 0, 128 * 1024));
        return [reader, ID3v2.parseStream(read, onComplete)];
    }
}

// ======================================================== //
// Import
// ========================================================= //

if (importLocalFiles) {
    // -- Getting Songs
    $(importLocalFiles).on('change', function () {
        // -- canPlay check function for supported audio formats
        var canPlay = function (type) {
            var nA = new Audio();
            return !!(nA.canPlayType && nA.canPlayType(type).replace(/no/, ''));
        }
        var files = this.files;
        if (files) {
            // -- Handling selected files and also 
            // -- checking Browser support for audio formats before importing them
            // ** Note: This will be implemented soon for player js
            var queue = [];
            var mp3 = canPlay('audio/mpeg;'),
                ogg = canPlay('audio/ogg; codecs="vorbis"'),
                aac = canPlay('audio/aac;'),
                m4a = canPlay('audio/m4a;'),
                mp4 = canPlay('audio/mp4;');
            // -- Looping through selected files to find playable songs
            // -- only, and then pushing them to queue
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                var path = file.webkitRelativePath || file.mozFullPath || file.urn || file.name;
                // Skip Metadata folder in OSX
                if (path.indexOf('.AppleDouble') != -1) {
                    continue;
                }

                // Create Queue arrey full of playable songs only
                if (file.name.indexOf('mp3') != -1 && mp3) {
                    queue.push(file);
                }
                if ((file.name.indexOf('ogg') != -1 || file.name.indexOf('oga') != -1) && ogg) {
                    queue.push(file);
                }
                if (file.name.indexOf('aac') != -1 && aac) {
                    queue.push(file);
                }
                if (file.name.indexOf('m4a') != -1 && m4a) {
                    queue.push(file);
                }
                if (file.name.indexOf('mp4') != -1 && mp4) {
                    queue.push(file);
                }
            }
            // -- Saveing queue to Storage
            if (importStorage) {
                localforage.setItem('selectedFiles', queue);
            }
        }
        // -- looping through queue
        if (queue.length) {
            for (var i = 0; i < queue.length; i++) {
                sP.import(queue, i)
            }
        }
    });
}
// ========================================================= //
// Storage: Loading Storage
// ========================================================= //

// -- Last Played Song ID
// ** Loading Last played song from storage is included inside Player library

// -- Starred Songs
if (localStorage.getItem('starredSongs')) {
    (function(){
        var resultSSIDs = localStorage.getItem('starredSongs');
        var getSSID = resultSSIDs.split(',');
        $.each(getSSID, function (i, val) {
            var creSSID = '#' + getSSID[i];
            sP.star(creSSID);
        });
    })();
}

// -- Import / Selected Files
if (importStorage) {
    localforage.getItem('selectedFiles', function (err, result) {
        if (result) {
            for (var i = 0; i < result.length; i++) {
                sP.import(result, i)
            }
        }
        if (err) {
            console.log(err)
        }
    });
}
// ========================================================= //