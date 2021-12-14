/**
 * Compute the trust factor for the given user
 * @param {Object} info - The user's info object
 * @returns {Number} - The user's trust factor
 */
const trustFactor = (info) => {
    try {

        let trustFactor = 100;
        const { timeSinceCreation, profileVsibility, steamLevel,
            gameCount, friendVACBanPercentage, commentSentimentScore,
            totalHours, totalHoursLinux, totalHoursLinuxPercentage,
            friendCount,
        } = info;

        // Private profile
        if (!profileVsibility) {
            return 0;
        }

        // New Player
        if (steamLevel < 5 && totalHours < 500) {
            trustFactor -= 5;
        }

        if (steamLevel < 5 && gameCount <= 2) {
            trustFactor -= 5;
        }

        // Friend count
        if (friendCount === 0 || friendCount <= 10) {
            trustFactor -= 5;
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



    } catch (err) {
        throw err;
    }
};


module.exports = { trustFactor, };