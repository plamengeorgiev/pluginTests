/**
 * Bumpers Plugin
 */

(function (window, videojs) {
    var defaults = {
    enabled: true
    };

    videojs.plugin('bumpers', function(options) {
        var _options = videojs.mergeOptions(defaults, options);

        if(JSON.parse(_options.enabled) == false || !_options.bumpers || _options.bumpers.length == 0) {
            return;
        }

        var _context = {
            player: this,
            bumpers: _options.bumpers || [],
            startPlayed: false,
            endPlayed: false,
            mainPlayed: false,
            poster: '',
        };

        _context.player.one("loadedmetadata", onLoadedMetadata);


        // listen for the "play" event and play the first bumper
        _context.player.on("play", onPlay);

        // listen for the "ended" event and play the next video or bumper
        _context.player.on('ended', onEnded);

        function onLoadedMetadata () {
            _context.bumpers.push({
                type: 'main',
                video: _context.player.mediainfo,
                playable: true
            });

            _context.poster = _context.player.poster();
        }

        preload();

        function onPlay (e) {
            if(!_context.startPlayed) {
                _context.player.hasEnded = false;

                var startOption = getVideoOption('start');
                _context.player.poster(null);

                if (startOption !== null && (startOption || !startOption.playable) && loadVideo(startOption, true, false)) {
                    e.stopImmediatePropagation();
                    _context.player.videoType = 'bumper';
                } else {
                    _context.mainPlayed = true;
                    _context.player.videoType = 'main';
                }
                
                _context.startPlayed = true;
            } else if (_context.endPlayed) {
                _context.player.hasEnded = true;
            }
        }

        function onEnded (e) {
            if(_context.startPlayed && !_context.mainPlayed) {
                e.stopImmediatePropagation();

                var mainOption = getVideoOption('main');

                if(mainOption) {
                    loadVideo(mainOption, true, true);
                    _context.mainPlayed = true;
                }

            } else if (_context.mainPlayed && !_context.endPlayed){
                e.stopImmediatePropagation();

                var endOption = getVideoOption('end');
				if (endOption !== null) {
                    e.stopImmediatePropagation();
                }
                _context.endPlayed = true;
                
                if(endOption) {
                    loadVideo(endOption, true, false);    
                } else {
                    //Go to beginning
                    onEnded(e);
                }
            } else if (_context.endPlayed) {
                var mainOption = getVideoOption('main');

                _context.startPlayed = _context.mainPlayed = _context.endPlayed = false;
				_context.player.hasEnded = true;
                _context.player.poster(_context.poster);

                loadVideo(mainOption, false, false);
            }
        }

        function loadVideo (option, autoPlay, counter) {
            _context.player.src(null);

            if(!counter) {
                counter = 0;
            }

            if(counter > 100) {
                return false;
            }

            if(option && option.request && option.request.status == 200) {
                if(option.request.readyState < 4) {
                    setTimeout(loadVideo, 500, option, autoPlay, ++counter);

                    return false;
                }
            }

            if(option.video && option.video.sources) {
                setVideoType(option);
                _context.player.src(option.video.sources);

                if(autoPlay) {
                _context.player.play();
                }
            }

            return true;
        }

        function preload() {
            for(var i = 0; i < _context.bumpers.length; i++ ) {
                if(_context.bumpers[i].videoId && _context.player.catalog) {
                    _context.bumpers[i].request = _context.player.catalog.getVideo(_context.bumpers[i].videoId, getVideo);
                    _context.bumpers[i].playable = false;
                }
            }
        }

        function getVideo(error, video) {
            for(var j = 0; j < _context.bumpers.length; j++) {
                if(_context.bumpers[j].videoId == video.id) {
                    if(!error) {
                        _context.bumpers[j].video = video;
                        _context.bumpers[j].playable = true;
                    } else {
                        _context.bumpers[j].playable = false;
                    }
                }
            }
        }

        function getVideoOption(type) {
            var opts = _context.bumpers.filter(function (value) {
                    return value.type === type;
                });

            if(opts && opts.length > 0) {
                return opts[0];
            }

            return null;
        }

        function setVideoType(option) {
            if(option && option.type) {
                if(option.type === 'main') {
                    _context.player.videoType = 'main';
                } else {
                    _context.player.videoType = 'bumper';
                }
            }
        }
    });
}(window, window.videojs));