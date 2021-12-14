// Dependencies
const { default: axios, } = require('axios');
const standardLex = require('apos-to-lex-form');
const { WordTokenizer, SentimentAnalyzer, PorterStemmer, } = require('natural');
const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
const tokenizer = new WordTokenizer;
const cheerio = require('cheerio');

// Creds
const { steamAPIKey, } = require('./creds.json');

// Steam profile url regex
const steamProfileRegEx = /https:\/\/steamcommunity.com\/id\/.{0,}\/$/;
const steamProfileRegExSteamId = /https:\/\/steamcommunity.com\/profiles\/[0-9]{17}\/$/;
// https://steamcommunity.com/id/Dr_Pepper_chemec/

// TF2 Game ID
const gameId = 440;

// Utility Functions

/**
 * Pre-process the text for sentiment analysis
 * @param {String} text - The text to be processed
 * @returns {Array<String> | Error} - The processed text
 */
const dataPrep = (text) => {
    try {

        // Convert all to lower case
        const toLow = text.toLowerCase();

        // Normalize (remove accent)
        const normalized = toLow.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Convert string to standard lexicons
        const toLex = standardLex(normalized);

        // Remove numbers and punctuations
        const alphaOnly = toLex.replace(/[^a-zA-Z\s]+/g, '');

        // Tokenize strings
        const tokenized = tokenizer.tokenize(alphaOnly);

        return tokenized;

    } catch (err) {
        throw err;
    }
};

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

        throw ('Invalid profile URL');


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

        return players;

    } catch (err) {
        throw err;
    }
};

/**
 * Get game stats from the steam id
 * @param {String} steamId - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's game stats
 */
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
            throw ('No games found');
        }

        const tf2Stats = response.games.filter(game => game.appid === gameId);

        return {
            gameCount: response.game_count,
            tf2Stats: tf2Stats[0],
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
            throw ('No games found');
        }

        return response;

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
        throw err.toJSON();
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
 * @returns {Number | Error} - The user's comments sentiment score
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
            throw reason;
        }

        // Load comments html into cheerio
        const $ = cheerio.load(comments_html);

        // Extract the comment divs
        const comments = $('div[class="commentthread_comment_text"]');

        // Extract the comments
        const pasrsedComments = comments.map((_, element) => $(element).text()).get().join('');

        // Process the comments
        const processedData = dataPrep(pasrsedComments);

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
 * @returns {Number} - The number of user's friends who have VAC Bans
 */
const getFriendVacBans = async (friendList) => {

    try {
        // Extract the steam ids from the friend list
        const steamIds = friendList.map(friend => friend.steamid);

        // Get ban info for all the steam ids
        const bans = await getBans(steamIds);

        // Filter out ids that have VAC Bans
        const banned = bans.filter(ban => ban.VACBanned === true).length;

        return banned;

    } catch (err) {
        throw err;
    }

};


getSteamId('https://steamcommunity.com/id/tinybuild/')
    .then(steamId => {
        console.log('steamID:', steamId);
        // Works regardless of the profile visibility
        // getPlayerSummaries(steamId).then(data => console.log(data)).catch(err => console.log(err));
        // getBans([steamId]).then(data => console.log(data)).catch(err => console.log(err));

        // Return "TEXT_HERE" if the user profile is private
        // getOwnedGames(steamId).then(data => console.log(data)).catch(err => console.log(err));
        // getRecentlyPlayedGames(steamId).then(data => console.log(data)).catch(err => console.log(err));
        // getComments(steamId).then(data => console.log(data)).catch(err => console.log(err));

        // Throws err if the profile is private
        // getFriends(steamId).then(data => {
        //     console.log(data)
        //     // getFriendVacBans(data).then(data => console.log(data));
        // }).catch(err => console.log(err));

        // Returns undefined if the profile is private
        // getSteamLevel(steamId).then(data => console.log(data)).catch(err => console.log(err));

        // Error-prone
        // getUserGameStats(steamId).then(data => console.log(data));


    }).catch(err => console.log(err));


/**
 * Compute the trust factor for the given user
 * @param {Object} info - The user's info object
 * @returns {Number} - The user's trust factor
 */
const trustFactor = (info) => {
    try {
        console.log(info);
    } catch (err) {
        throw err;
    }
};