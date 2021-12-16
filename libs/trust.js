/**
 * Compute the trust factor for the given user
 * @param {Object} info - The user's info object
 * @returns {Promise<Number> | Error} - The user's trust factor
 */
const trustFactor = (info) => {
    try {

        // Base trust factor
        let trustFactor = 100;


        const { timeSinceCreation, profileVsibility, steamLevel,
            gameCount, friendVACBanPercentage, commentSentimentScore,
            totalHours, totalHoursLinux, totalHoursLinuxPercentage,
            friendCount, NumberOfVACBans, VACBanned,
        } = info;

        // Private profile
        if (!profileVsibility) {
            return 0;
        }

        // New Player
        if (steamLevel < 5 && totalHours < 500) {
            trustFactor -= 5;
        }

        if (totalHours < 1000) {
            trustFactor -= 20;
        }

        if (steamLevel < 5 && gameCount <= 2 && gameCount > 0) {
            trustFactor -= 5;
        }

        if (gameCount <= 0) {
            trustFactor -= 10;
        }

        // Friend count
        if (friendCount === 0 || friendCount <= 10) {
            trustFactor -= 5;
        }

        if (!friendVACBanPercentage) {
            trustFactor -= 10;
        }

        // VAC banned friends
        if (friendVACBanPercentage > 0) {
            trustFactor -= 5;
        }

        if (friendVACBanPercentage > 0.06) {
            trustFactor -= 5;
        }

        // Account age
        if (timeSinceCreation < 365) {
            trustFactor -= 5;
        }

        // Linux
        if (totalHoursLinux) {
            trustFactor -= 5;
        }

        if (totalHoursLinuxPercentage > 0.1) {
            trustFactor -= 5;
        }

        // VAC Bans
        if (VACBanned) {
            trustFactor -= 10;
        }

        if (NumberOfVACBans >= 2) {
            trustFactor -= 10 * (NumberOfVACBans - 1);
        }

        // Sentiment
        if (commentSentimentScore <= -1) {
            trustFactor -= 3;
        }


        return trustFactor;


    } catch (err) {
        throw err;
    }
};


module.exports = { trustFactor, };