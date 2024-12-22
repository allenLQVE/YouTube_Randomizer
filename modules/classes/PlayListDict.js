import PlayList from "./PlayList.js";

export default class PlayListDict {
    #dict;

    /**
     * Construct a PLaylist object that contains all the loaded playlists
     */
    constructor() {
        this.#dict = {};
    }

    get dict() {
        return this.#dict;
    }

    /**
     * Add new playlist to dict
     * 
     * @param {string} id playlist id
     * @param {string} thumbnail playlist thumbnail url
     * @param {string} name playlist name
     */
    add(id, thumbnail, name) {
        if (id in this.#dict) {
            return;
        }
        this.#dict[id] = new PlayList(id, thumbnail, name);
    }

    /**
     * Get Playlist by id
     * 
     * @param {stirng} id 
     * @returns PlayList class
     */
    getPlaylist(id) {
        return this.#dict[id];
    }

    /**
     * Get Playlist videos
     * 
     * @param {stirng} id 
     * @returns list of videos
     */
    getVideos(id) {
        return this.#dict[id].videos;
    }
}