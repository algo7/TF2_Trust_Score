// Dependencies
const standardLex = require('apos-to-lex-form');
const { WordTokenizer, } = require('natural');
const tokenizer = new WordTokenizer;

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

/**
 * @param {Number} date - The date to be converted
 * @returns {Number} - The converted date
 */
const convertToDate = (date) => {
    try {
        return new Date(date * 1000);
    } catch (err) {
        throw err;
    }
};

/**
 * Returns an array with arrays of the given size.
 * @param {Array} myArray - Array to split
 * @param {Integer} chunkSize - Size of every group
 * @returns {<Array<Array>> | Error} - The splitted array
 */
const chunkArray = (myArray, chunkSize) => {
    const results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunkSize));
    }

    return results;
};

module.exports = { dataPrep, convertToDate, chunkArray, };