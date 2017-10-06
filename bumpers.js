/**
 * Random Bumpers Using a Playlist
 */
videojs.plugin('bumpers', function () {

    var myPlayer = this,
        currentBumperIndex = 0,
        currentBumperId,
        bumperRandomNumber,
        currentVideo,
        currentVideoIndex = 0,
        playlistLength = 0,
        playlistDone = false,
        playBumper = true,
        firstTime = true,
        firstBumper = true,
        bumperData = ["5596636430001", "5597735119001", "5593401007001", "5593129603001", "5513172885001"],
        bumperDataLength = bumperData.length;

    // listen for the "ended" event and play the next video or bumper
    myPlayer.on("ended", function () {
        if (!playlistDone) {
            if (playBumper) {
                playRandomBumper();
                playBumper = false;
            } else {
                playNextVideo();
                playBumper = true;
            }
        }
    });

    function playRandomBumper() {
        // randomly select the bumper video to play
        bumperRandomNumber = Math.floor(Math.random() * bumperDataLength);
        currentBumperId = bumperData[bumperRandomNumber];
        // get the video for the current randomly selected video Id
        myPlayer.catalog.getVideo(currentBumperId, function (error, video) {
            //deal with error
            if (error) {
                console.log('error getting bumper', error);
            }
            myPlayer.catalog.load(video);
            if (firstBumper) {
                firstBumper = false;
            } else {
                myPlayer.play();
            }
        });
    };

    function playNextVideo() {
        if (firstTime) {
            loadPlaylist();
            firstTime = false;
        } else {
            if (currentVideoIndex >= playlistLength - 1) {
                playlistDone = true;
            }
            myPlayer.playlist.currentItem(currentVideoIndex);
            myPlayer.play();
        }
        currentVideoIndex += 1;
    };

    function loadPlaylist() {
        myPlayer.catalog.getPlaylist('4450721964001', function (error, playlist) {
            myPlayer.catalog.load(playlist);
            playlistLength = myPlayer.playlist().length;
        });
    };

    // play first bumper
    playRandomBumper();
    playBumper = false;

});