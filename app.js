// Dependencies
const { default: axios } = require('axios');

// Creds
const { steamAPIKey } = require('./creds.json');

// Steam profile url regex
const steamProfileRegEx = /https:\/\/steamcommunity.com\/id\/*/
// https://steamcommunity.com/id/Dr_Pepper_chemec/


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
            url: `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamAPIKey}&vanityurl=${userName}`,
            method: 'GET',
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
            url: `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamAPIKey}&steamids=${steamId}`,
            method: 'GET',
        }

        // Make the request
        const { data: { response: { players } } } = await axios(requestConfig);

        return players

    } catch (err) {
        console.log(err);
    }
}

const userName = extractUserName('https://steamcommunity.com/id/Dr_Pepper_chemec/')
getSteamId(userName).then(steamId => {
    getPlayerSummaries(steamId).then(data => console.log(data));
})
