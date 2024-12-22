import Video from "./Video.js";

export default class PlayList {
    id;
    thumbnail;
    name;
    #videoList;

    /**
     * constructor
     */
    constructor(id, thumbnail, name) {
        this.id = id;
        this.thumbnail = thumbnail;
        this.name = name;
        this.#videoList = new Array();
    }

    get videos() {
        return this.#videoList;
    }

    /**
     * Shuffle videos in the playlist
     * 
     * @returns Shuffled array of videos
     */
    shuffle() {
        const SHUFFLE_COUNT = 2;
        for (let _ = 0; _ < SHUFFLE_COUNT; _++) {
            for (let i = 0; i < this.#videoList.length; i++) {
                const j = Math.floor(Math.random() * (this.#videoList.length));
                [this.#videoList[i], this.#videoList[j]] = [this.#videoList[j], this.#videoList[i]];
            }
        }
        
        return this.#videoList;
    }

    /**
     * Add new video to the list
     * 
     * @param {string} id video id
     * @param {string} thumbnail video thumbail
     * @param {string} name video name
     */
    add(id, thumbnail, name) {
        if (this.#videoList.some(element => element.id === id)) {
            return;
        }

        this.#videoList.push(new Video(id, thumbnail, name));
    }
}