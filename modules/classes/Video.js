export default class Video {
    id;
    thumbnail;
    name;

    /**
     * Video class
     */
    constructor(id, thumbnail, name) {
        this.id = id;
        this.name = name;
        this.thumbnail = thumbnail;
    }
}