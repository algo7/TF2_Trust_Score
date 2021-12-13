// Dependencies
const { default: axios } = require('axios');

// Creds
const { steamAPIKey } = require('./creds.json');

// Steam profile url regex
const steamProfileRegEx = /https:\/\/steamcommunity.com\/id\/.{0,}\/$/
const steamProfileRegExSteamId = /https:\/\/steamcommunity.com\/profiles\/[0-9]{17}\/$/
// https://steamcommunity.com/id/Dr_Pepper_chemec/

// TF2 Game ID
const gameId = 440;

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
                url: `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/`,
                method: 'GET',
                params: {
                    key: steamAPIKey,
                    vanityurl: userName,
                }
            }

            // Make the request
            const { data: { response: { steamid } } } = await axios(requestConfig);

            return steamid;
        }

        throw ('Invalid profile URL');


    } catch (err) {
        console.log(err);
    }
}

/**
 * Get player summaries from the steam id
 * @param {String} steamId - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's steam profile
 */
const getPlayerSummaries = async (steamId) => {
    try {

        // The request config
        const requestConfig = {
            url: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamids: steamId,
            }
        }

        // Make the request
        const { data: { response: { players } } } = await axios(requestConfig);

        return players

    } catch (err) {
        console.log(err);
    }
}

/**
 * Get game stats from the steam id
 * @param {String} steamId - The user's steam id 
 * @returns {Promise<Object> | Error} - The user's game stats
 */
const getUserGameStats = async (steamId) => {
    try {

        // The request config
        const requestConfig = {
            url: ` https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                appid: gameId,
            }
        }

        // Make the request
        const { data: { playerstats } } = await axios(requestConfig);

        return playerstats;

    } catch (err) {
        console.log(err);
    }
}

/**
 * Get user's owned games count and tf2 game stats
 * @param {String} steamId - The user's steam id
 * @returns @returns {Promise<Object> | Error} - The user's owned game and playtime
 */
const getOwnedGames = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: `http://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                format: 'json',
                include_appinfo: 1,
                include_played_free_games: 1,
            }
        }

        // Make the request
        const { data: { response } } = await axios(requestConfig);

        const tf2Stats = response.games.filter(game => game.appid === gameId);

        return {
            gameCount: response.game_count,
            tf2Stats: tf2Stats[0],
        }


    } catch (err) {
        console.log(err);
    }
}

/**
 * Get user's recently played games for the past 2 weeks
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Object> | Error} - The user's recently played games for the past 2 weeks
 */
const getRecentlyPlayedGames = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: `http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v1/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                format: 'json',
            }
        }

        // Make the request
        const { data: { response } } = await axios(requestConfig);


        return response;

    } catch (err) {
        console.log(err);
    }
}

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
            url: `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamids: steamIdsString,
                format: 'json',
            }
        }

        // Make the request
        const { data: { players } } = await axios(requestConfig);

        return players;

    } catch (err) {
        console.log(err);
    }
}

/**
 *  Get user's friend list
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Object> | Error} - The user's friends 
 */
const getFriends = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: `http://api.steampowered.com/ISteamUser/GetFriendList/v1/`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
                relationship: 'friend',
            }
        }

        // Make the request
        const { data: { friendslist: { friends } } } = await axios(requestConfig);

        return friends;

    } catch (err) {
        console.log(err);
    }
}

/**
 * Get user's steam level
 * @param {String} steamId - The user's steam id
 * @returns {Promise<Number> | Error} - The user's steam level
 */
const getSteamLevel = async (steamId) => {
    try {
        // The request config
        const requestConfig = {
            url: `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/`,
            method: 'GET',
            params: {
                steamid: steamId,
                key: steamAPIKey,
            }
        }

        const { data: { response: { player_level } } } = await axios(requestConfig);

        return player_level;

    } catch (err) {
        console.log(err);
    }
}


getSteamId('https://steamcommunity.com/profiles/76561198030958226/')
    .then(steamId => {
        console.log('steamID:', steamId);
        // getPlayerSummaries(steamId).then(data => console.log(data));
        // getOwnedGames(steamId).then(data => console.log(data));
        // getRecentlyPlayedGames(steamId).then(data => console.log(data));
        // getBans([steamId]).then(data => console.log(data));
        // getFriends(steamId).then(data => console.log(data));
        // getSteamLevel(steamId).then(data => console.log(data));

        // Error-prone
        // getUserGameStats(steamId).then(data => console.log(data));
    }).catch(err => console.log(err));