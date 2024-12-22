const API_KEY = 'AIzaSyBAcu1G32jZfZXsWQzMiDedpRDoM6emfYg';

/**
 * Check if the access token is valid
 * 
 * @returns true if the token is valid
 */
function checkToken() {
    var params = JSON.parse(localStorage.getItem('oauth2-params'));
    if (params && params['access_token'] && params['expire'] > Date.now()) {
        return true
    } else {
        localStorage.removeItem("oauth2-params");
        window.location.href = "http://localhost/src/YouTube_RandomViewer/";
        return false
    }
}

/**
 * Make an api request for playlists own by the user.
 */
async function requestPlaylists() {
    var params = JSON.parse(localStorage.getItem('oauth2-params'));
    if (checkToken()) {
        const header = new Headers({
            'Authorization': `Bearer ${params['access_token']}`,
            'Accept': 'application/json'
        })
        return await fetch('https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50&mine=true' +
             '&key=' + API_KEY, 
            {
                headers: header,
                method: 'GET'
            }
        ).then(
            res => res.json()
        ).then((data) => {
            return data.items
        });
    }
}

/**
 * Make an api request for videos in a playlist.
 * 
 * @param {*} id Playlist Id
 * @param {*} nextPage The nextPage Token
 */
async function requestVideos(id, nextPage = null) {
    var params = JSON.parse(localStorage.getItem('oauth2-params'));
    if (checkToken()) {
        const header = new Headers({
            'Authorization': `Bearer ${params['access_token']}`,
            'Accept': 'application/json'
        })

        let npToken = "";
        if (nextPage !== null) {
            npToken = `&pageToken=${nextPage}`;
        }

        return await fetch('https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50' + 
            npToken +
            '&playlistId=' + id + 
            '&key=' + API_KEY
            , 
            {
                headers: header,
                method: 'GET'
            }
        ).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error("Playlist " + id + " not found.")
            }
        }
        ).then(async (data) => {
            if (data.error) {
                console.log(data.error);
            } else {
                // recursion if nextPage token is not null
                if (data.nextPageToken) {
                    return await requestVideos(id, data.nextPageToken).then((recurData) => {
                        return [...data.items, ...recurData];
                    });
                } else {
                    return data.items;
                }
            }
        }).catch((error) => {
            alert(error);
        });
    }
}

/**
 * Make an api request for a playlist.
 * 
 * @param {number} id playlist id 
 */
async function requestAPlaylist(id) {
    var params = JSON.parse(localStorage.getItem('oauth2-params'));
    if (checkToken()) {
        const header = new Headers({
            'Authorization': `Bearer ${params['access_token']}`,
            'Accept': 'application/json'
        })
        return await fetch('https://youtube.googleapis.com/youtube/v3/playlists?part=snippet&maxResults=50' +
            '&id=' + id + 
            '&key=' + API_KEY, 
            {
                headers: header,
                method: 'GET'
            }
        ).then(
            res => res.json()
        ).then((data) => {
            return data.items;
        });
    }
}

export {
    requestPlaylists,
    requestVideos,
    requestAPlaylist
}