// Dependencies
const { default: axios } = require('axios');

// Creds
const { steamAPIKey } = require('./creds.json');

// Steam profile url regex
const steamProfileRegEx = /https:\/\/steamcommunity.com\/id\/*/
// https://steamcommunity.com/id/Dr_Pepper_chemec/

// TF2 Game ID
const gameId = 440;

/**
 * Get the user name from the user's profile url
 * @param {String} profileUrl - The user's profile url
 * @returns {String} - The user's name
 */
const extractUserName = (profileUrl) => {
    try {
        // Check if the profile url is valid
        if (!steamProfileRegEx.test(profileUrl)) {
            throw ('Invalid profile URL');
        }
        // Extract the user name
        const userName = profileUrl.split('/')[4];

        return userName;

    } catch (err) {
        console.log(err);
    }
}

/**
 * Get the steam id from the user name
 * @param {String} userName - The user name
 * @returns {Promise<String> | Error} - The user's steam id
 */
const getSteamId = async (userName) => {
    try {

        // The request config
        const requestConfig = {
            url: `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamAPIKey}`,
            method: 'GET',
            params: {
                vanityurl: userName,
            }
        }

        // Make the request
        const { data: { response: { steamid } } } = await axios(requestConfig);

        return steamid;
    } catch (err) {
        console.log(err.toJSON());
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
            url: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamAPIKey}`,
            method: 'GET',
            params: {
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
            url: ` http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=${gameId}`,
            method: 'GET',
            params: {
                key: steamAPIKey,
                steamid: steamId,
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
            url: `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamAPIKey}`,
            method: 'GET',
            params: {
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
        console.log(err.toJSON());
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
            url: ` http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${steamAPIKey}`,
            method: 'GET',
            params: {
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

const userName = extractUserName('https://steamcommunity.com/id/avivlo0612/')
getSteamId(userName).then(steamId => {
    // console.log(steamId);
    // getPlayerSummaries(steamId).then(data => console.log(data));
    // getUserGameStats(steamId).then(data => console.log(data));
    // getOwnedGames(steamId).then(data => console.log(data));
    // getRecentlyPlayedGames(steamId).then(data => console.log(data));
})