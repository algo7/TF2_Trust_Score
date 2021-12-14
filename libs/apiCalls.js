// Dependencies
const { default: axios, } = require('axios');
const { SentimentAnalyzer, PorterStemmer, } = require('natural');
const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
const cheerio = require('cheerio');

// Custom Modules
const { dataPrep, convertToDate, } = require('./utils');

// Creds
const { steamAPIKey, } = require('../creds.json');

// Custom Error Class
const errorResponse = require('./customErrorClass');

// Steam profile url regex
const steamProfileRegEx = /https:\/\/steamcommunity.com\/id\/.{0,}\/$/;
const steamProfileRegExSteamId = /https:\/\/steamcommunity.com\/profiles\/[0-9]{17}\/$/;


// TF2 Game ID
const gameId = 440;


// Primary Functions
/**
 * Get the steam id from the user name
 * @param {String} profileUrl - The user's profile url
 * @returns {Promise<String> | Error} - The user's steam id
 */
const getSteamId = async (profileUrl) => {
    try {

        // Check if the profile url is valid
        if (steamProfileRegExSteamId.test(profileUrl)) {
            // Extract the user name
            const steamid = profileUrl.split('/')[4];

            return steamid;
        }

        // Check if the profile url is valid
        if (steamProfileRegEx.test(profileUrl)) {

            // Extract the user name
            const userName = profileUrl.split('/')[4];

            // The request config
            const requestConfig = {
                url: 'http://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/',
                method: 'GET',
                params: {
                    key: steamAPIKey,
                    vanityurl: userName,
                },
            };

            // Make the request
            const { data: { response: { steamid, }, }, } = await axios(requestConfig);

            return steamid;
        }

        throw new errorResponse('Invalid profile URL', 400, false);


    } catch (err) {
        throw err;
    }
};

/**
 * Get player summaries from the steam id
 * @param {String} steamId - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's steam profile
 */
const getPlayerSummaries = async (steamId) => {
    try {

        // The request config
        const requestConfig = {
            url: 'http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamids: steamId,
            },
        };

        // Make the request
        const { data: { response: { players, }, }, } = await axios(requestConfig);

        if (players.length === 0) {
            throw new errorResponse('No player found.', 404, false);
        }

        return players[0];

    } catch (err) {
        throw err;
    }
};


/**
 * Get user's owned games count and tf2 game stats
 * @param {String} steamId - The user's steam id
 * @returns @returns {Promise<Object> | Error} - The user's owned game and playtime
 */
const getOwnedGames = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: 'http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                format: 'json',
                include_appinfo: 1,
                include_played_free_games: 1,
            },
        };

        // Make the request
        const { data: { response, }, } = await axios(requestConfig);

        // Check if the response is empty
        if (Object.keys(response).length === 0) {
            return {
                gameCount: 0,
                tf2Stats: {
                    playtime_forever: 0,
                    playtime_linux_forever: 0,
                },
            };
        }

        // Get the tf2 game stats
        const tf2Stats = response.games.filter(game => game.appid === gameId);

        return {
            gameCount: response.game_count,
            // Account for user not having / has hidden tf2 in/from their inventories
            tf2Stats: tf2Stats[0] || {
                playtime_forever: 0,
                playtime_linux_forever: 0,
            },
        };

    } catch (err) {
        throw err;
    }
};

/**
 * Get user's recently played games for the past 2 weeks
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Object> | Error} - The user's recently played games for the past 2 weeks
 */
// eslint-disable-next-line no-unused-vars
const getRecentlyPlayedGames = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: 'http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                format: 'json',
            },
        };

        // Make the request
        const { data: { response, }, } = await axios(requestConfig);

        // Check if the response is empty
        if (Object.keys(response).length === 0) {
            throw new errorResponse('No games found', 404, false);
        }

        return response;

    } catch (err) {
        throw err;
    }
};

/**
 * Get game stats from the steam id
 * @param {String} steamId - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's game stats
 */
// eslint-disable-next-line no-unused-vars
const getUserGameStats = async (steamId) => {
    try {

        // The request config
        const requestConfig = {
            url: ' https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                appid: gameId,
            },
        };

        // Make the request
        const { data: { playerstats, }, } = await axios(requestConfig);

        return playerstats;

    } catch (err) {
        throw err;
    }
};

/**
 *  Get user's friend list
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Object> | Error} - The user's friends 
 */
const getFriends = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: 'http://api.steampowered.com/ISteamUser/GetFriendList/v1/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                relationship: 'friend',
            },
        };

        // Make the request
        const { data: { friendslist: { friends, }, }, } = await axios(requestConfig);

        return friends;

    } catch (err) {

        if (err.toJSON().status === 401) {
            return [];
        }
        throw err.toJSON().status;
    }
};

/**
 * Get user's bans info
 * @param {Array<String>} steamIds - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's ban info
 */
const getBans = async (steamIds) => {
    try {

        // Convert an array of steam ids to a comma separated string
        const steamIdsString = steamIds.join(',');

        // The request config
        const requestConfig = {
            url: 'https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/',
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamids: steamIdsString,
                format: 'json',
            },
        };

        // Make the request
        const { data: { players, }, } = await axios(requestConfig);

        return players;

    } catch (err) {
        throw err;
    }
};

/**
 * Get user's steam level
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Number> | Error} - The user's steam level
 */
const getSteamLevel = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: 'https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/',
            method: 'GET',
            params: {
                steamid: steamId,
                key: steamAPIKey,
            },
        };

        const { data: { response: { player_level, }, }, } = await axios(requestConfig);

        return player_level;

    } catch (err) {
        throw err;
    }
};

/**
 * Get the sentiment score of the user's comments
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Number >| Error} - The user's comments sentiment score
 */
const getComments = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: `http://steamcommunity.com/comment/Profile/render/${steamId}/-1/`,
            method: 'GET',
            params: {
                start: 0,
                totalcount: 1000,
                count: 1000,
            },
        };

        // Make the request
        const { data: { success, comments_html, error: reason, }, } = await axios(requestConfig);

        // If it is a private profile
        if (!success) {
            throw new errorResponse(reason, 403, false);
        }

        // Load comments html into cheerio
        const $ = cheerio.load(comments_html);

        // Extract the comment divs
        const comments = $('div[class="commentthread_comment_text"]');

        // Extract the comments
        const pasrsedComments = comments.map((_, element) => $(element).text()).get().join('');

        // Process the comments
        const processedData = dataPrep(pasrsedComments);

        // If there is text-based comments => full penalty
        if (processedData.length === 0) {
            return -1;
        }

        // Perform sentiment analysis on the comments
        const analysis = analyzer.getSentiment(processedData);

        return analysis;

    } catch (err) {
        throw err;
    }
};

// Composite Functions
/**
 * Calculate the number of user's friends who have VAC Bans
 * @param {Object} friendList - The user's friend list
 * @returns {Promise<Number> | Error} - The % of user's friends who have VAC Bans
 */
const getFriendVacBansPercentage = async (friendList) => {

    try {

        // If the friend list is empty => full penalty
        if (friendList.length === 0) {
            return 1;
        }

        // Extract the steam ids from the friend list
        const steamIds = friendList.map(friend => friend.steamid);

        // Get ban info for all the steam ids
        const bans = await getBans(steamIds);

        // Filter out ids that have VAC Bans
        const banned = bans.filter(ban => ban.VACBanned === true).length;

        // Calculate the % of friends who have VAC Bans
        const friendVACBanPercentage = banned / friendList.length;

        return friendVACBanPercentage;

    } catch (err) {
        throw err;
    }

};

/**
 * Gather information required for computing the trust factor
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Object> | Error} - The processed user's data
 */
const trustFactorDataPreprocessing = async (steamId) => {
    try {

        // Extract the profile visibility and the profile time of creation from the player summaries
        const playerSummary = await getPlayerSummaries(steamId);

        const { steamid, communityvisibilitystate, timecreated, } = playerSummary;

        // User profile visibility
        let profileVsibility = null;

        if (communityvisibilitystate == 3) {
            profileVsibility = true;
        }

        if (communityvisibilitystate === 1) {
            profileVsibility = false;
        }

        // VAC Ban data
        const bans = await getBans([steamId]);

        const { VACBanned, NumberOfVACBans, } = bans[0];

        // Handles private profiles
        if (!profileVsibility) {

            return {
                steamid,
                profileVsibility,
                timeSinceCreation: 0,
                steamLevel: 0,
                VACBanned,
                NumberOfVACBans,
                playerSummary,
            };
        }

        // Time since creation in days
        const timeSinceCreation = Math
            .ceil((Date.now() - convertToDate(timecreated)) / (1000 * 3600 * 24));

        // Get player's steam level
        const steamLevel = await getSteamLevel(steamId);


        // Get tf2 play time
        const { gameCount, tf2Stats: { playtime_forever,
            playtime_linux_forever, }, } = await getOwnedGames(steamId);


        // Get friends
        const friendList = await getFriends(steamId);

        // Friend list with VAC Bans %
        const friendVACBanPercentage = await getFriendVacBansPercentage(friendList);

        // Get comment's sentiment score
        const commentSentimentScore = await getComments(steamId);

        return {
            steamid,
            timeSinceCreation,
            profileVsibility,
            steamLevel,
            gameCount,
            friendVACBanPercentage,
            commentSentimentScore,
            VACBanned,
            NumberOfVACBans,
            totalHours: Math.floor(playtime_forever / 60),
            totalHoursLinux: Math.floor(playtime_linux_forever / 60),
            totalHoursLinuxPercentage: playtime_linux_forever / playtime_forever,
            friendCount: friendList.length,
            playerSummary,
        };

    } catch (err) {
        throw err;
    }
};

module.exports = { trustFactorDataPreprocessing, getSteamId, };

// trustFactorDataPreprocessing('https://steamcommunity.com/id/MyDickHasTheSIzeOfAnAirport/')
//     .then(data => console.log(data))
//     .catch(err => console.log(err));

// getSteamId('                        ')
//     .then(steamId => {
//         console.log('steamID:', steamId);
//         // Works regardless of the profile visibility
//         // getPlayerSummaries(steamId).then(data => {
//         //     console.log(data);

//         // }).catch(err => console.log(err));
//         // getBans([steamId]).then(data => console.log(data)).catch(err => console.log(err));

//         // Return "TEXT_HERE" if the user profile is private
//         // getOwnedGames(steamId).then(data => console.log(data)).catch(err => console.log(err));
//         // getRecentlyPlayedGames(steamId).then(data => console.log(data)).catch(err => console.log(err));
//         // getComments(steamId).then(data => console.log(data)).catch(err => console.log(err));

//         // Throws err if the profile is private
//         // getFriends(steamId).then(data => {
//         //     // console.log(data);
//         //     getFriendVacBans(data).then(data => console.log(data));
//         // }).catch(err => console.log(err));

//         // Returns undefined if the profile is private
//         // getSteamLevel(steamId).then(data => console.log(data)).catch(err => console.log(err));

//         // Error-prone
//         // getUserGameStats(steamId).then(data => console.log(data));


//     }).catch(err => console.log(err));
