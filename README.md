YouTube has a terrible shuffle function for their playlist. Therefore, I wrote a player that allow user to search, merge, and play their playlists.The user need to login with their Google account to grant access to the application. After user login, their playlists in their account will be loaded automatically. User can also search our merge the playlist by using the search bar.

This application is built by JavaScript only. It utilizes the Google Ouath2 for user to login their Google account, and uses Google YouTube API to get playlists from user's account. After the user fetch the videoes in a playlist, the videos will be played using the YouTube iFrame API.