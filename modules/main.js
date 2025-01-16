import { oauth2SignIn } from "./login.js";
import { requestPlaylists, requestVideos, requestAPlaylist } from "./youtubeAPI.js";
import PlayListDict from "./classes/PlayListDict.js";
import PlayList from "./classes/PlayList.js";

let playListsDict = new PlayListDict();
var player;

/**
 * play youtube video with IFrame
 * 
 * @param {string} id Playlist Id
 * @param {number} index index of selected video
 */
function playVideo(id, index) {
    const playerDiv = document.querySelector("#player");
    playerDiv.innerHTML = "";

    const arr = playListsDict.getVideos(id);
    let playlist = "";
    const multiplier = Math.floor(index / 200);
    // iframe limits the video in the list to 200
    for (let i = 0; (i < 200 && i + (200 * multiplier) < arr.length); i++) {
        playlist += arr[i + (200 * multiplier)].id + ",";
    }
    
    const iframe = document.createElement("iframe");
    iframe.id = 'iframe'
    iframe.src = `https://www.youtube.com/embed/${arr[index].id}?playlist=${playlist}&autoplay=1&fs=1&enablejsapi=1`;
    iframe.allow = "autoplay;fullscreen;";
    playerDiv.appendChild(iframe);

    player = new YT.Player("iframe", {
        events: {
            'onStateChange': onPlayerStateChange
            // 'onStateChange': (event) => {
            //     console.log(event.data);
            //     if (event.data === 0) {
            //         playVideo(id, 200 * (multiplier + 1));
            //     }
            // }
        }
    });

    document.querySelector("body").scrollIntoView();
}
function onPlayerStateChange(event) {
    console.log(event.data);
}

/**
 * Display playlists.
 */
function showPlaylist() {
    requestPlaylists().then((data) => {
        if (data == null || data == undefined || data.length === 0) {
            return;
        }

        const ul = document.querySelector("#playlists");
        data.forEach(element => {
            playListsDict.add(element.id, element.snippet.thumbnails.default.url, element.snippet.title);

            const newLi = createPlaylist(playListsDict.getPlaylist(element.id))
            ul.appendChild(newLi);
        });
    });
}

/**
 * Create a playlist in the ul
 * 
 * @param {PlayList} playlist playlist
 */
function createPlaylist(playlist) {
    const li = document.createElement("li");
    li.id = playlist.id;
    li.classList.add("playlist");

    const div = document.createElement("div");
    div.innerHTML += `<img src="${playlist.thumbnail}" alt='${playlist.name}'>`;
    div.innerHTML += `<div><span>${playlist.name}</span></div>`;
    div.setAttribute("draggable", true);
    div.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", playlist.id);
    });
    li.appendChild(div);

    const videoUl = document.createElement("ul");
    videoUl.id = `video_${playlist.id}`;
    videoUl.style.display = "none";
    li.appendChild(videoUl);

    li.querySelector("div").addEventListener("click", () => {
        if(videoUl.style.display == "none") {
            hideAllVideos();

            const playlistObj = playListsDict.getPlaylist(playlist.id);
            if(playlistObj.videos.length > 0) {
                playlistObj.shuffle();
                showVideos(playlist.id);
            }
            videoUl.style.display = "block";
        } else {
            videoUl.style.display = "none";
        }
    });

    // load content of the playlist when clicked
    li.addEventListener("click", function eventHandler(){
        let ids = [playlist.id];
        if (playlist.id.includes(',')) {
            ids = playlist.id.split(',');
        }

        const promises = [];
        ids.forEach(element => {
            const playlistObj = playListsDict.getPlaylist(element);
            if (playlistObj.videos.length === 0) {
                promises.push(
                    getVideos(element).then((data) => {
                        data.forEach((video) => {
                            playlistObj.add(video.snippet.resourceId.videoId, video.snippet.thumbnails.default.url, video.snippet.title);
                        });
                    })
                );
            }
        });

        Promise.all(promises).then(() => {
            const playlistObj = playListsDict.getPlaylist(playlist.id);
            if (ids.length > 1) {
                const playlistObj = playListsDict.getPlaylist(playlist.id);
                ids.forEach(element => {
                    playListsDict.getVideos(element).forEach(video => {
                        playlistObj.add(video.id, video.thumbnail, video.name);
                    })
                });
            }

            playlistObj.shuffle();
            showVideos(playlist.id);
        });

        this.removeEventListener("click", eventHandler);
    });
    return li;
}

/**
 * Get videos in the playlist
 * 
 * @param {string} id playlist id
 */
async function getVideos(id) {
    if (id in playListsDict.dict && playListsDict.getVideos(id).length > 0) {
        return  playListsDict.getVideos(id);
    }
    return await requestVideos(id).then((data) => {
        const result = new Set();
        data.forEach((video) => {
            if (video.snippet.title === "Private video" || video.snippet.title === "Deleted video" ) {
                return;
            }
            result.add(video);
        });
        return result;
    });
}

/**
 * Display videos in the playlist
 * 
 * @param {string} id playlist id
 */
function showVideos(id) {
    const ul = document.querySelector(`[id="video_${id}"]`);
    ul.innerHTML = "";

    playListsDict.getVideos(id).forEach((element, index) => {
        const li = document.createElement("li");
        li.id = element.id;
        li.innerHTML += `<img src="${element.thumbnail}" alt='${element.name}'>`;
        li.innerHTML += `<div><span>${element.name}</span></div>`;

        li.addEventListener("click", () => {
            playVideo(id, index);
        });

        ul.appendChild(li);
    });
}

/**
 * search for a playlist with Id in input
 */
function search() {
    const searchInput = document.querySelector("#searchInput");
    let input = searchInput.value;
    searchInput.value = '';
    input = input.replaceAll(' ','');

    if (input.includes(',')) {
        let playlists = input.split(',').filter((id) => id !== "");
        playlists = [...new Set(playlists)];
        input = playlists.join(',');
    }
    
    if (input === '') {
        alert("Empty");
        return;
    }

    if (document.querySelector(`[id="video_${input}"]`) !== null) {
        alert("Playlist already loaded");
        return;
    }

    requestAPlaylist(input).then((data) => {
        if (data === undefined || data === null || data.length === 0) {
            return;
        }
        
        const ul = document.querySelector("#playlists");
        
        let title = data[0].snippet.title;
        if (data.length > 1) {
            title = "";
            data.forEach(element => {
                title += element.snippet.title + ", ";

                playListsDict.add(element.id, element.snippet.thumbnails.default.url, element.snippet.title);
            });
            title = title.substring(0, title.length - 2);
        }
        playListsDict.add(input, data[0].snippet.thumbnails.default.url, title);

        ul.prepend(createPlaylist(playListsDict.getPlaylist(input)));
        
        document.querySelector(".playlist").scrollIntoView();
    });
}

/**
 * Hide other lists when open a list
 */
function hideAllVideos() {
    const lists = document.querySelectorAll(".playlist");
    lists.forEach(listElement => {
        listElement.querySelector("ul").style.display = "none";
    });
}

export {
    showPlaylist,
    oauth2SignIn,
    search
}