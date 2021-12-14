/**
 * Compute the trust factor for the given user
 * @param {Object} info - The user's info object
 * @returns {Number} - The user's trust factor
 */
const trustFactor = (info) => {
    try {
        // const a = {
        //     timeSinceCreation: 1709,
        //     profileVsibility: true,
        //     steamLevel: 10,
        //     gameCount: 15,
        //     friendVACBanPercentage: 0.08771929824561403,
        //     commentSentimentScore: 0.05328269126424308,
        //     totalHours: 4447.266666666666,
        //     totalHoursLinux: 41,
        //     totalHoursLinuxPercentage: 0.009436507817535864,
        //     friendCount: 285,
        // };

        // { profileVsibility: false, timeSinceCreation: 0, steamLevel: 0 }
        console.log(info);
    } catch (err) {
        throw err;
    }
};

module.exports = { trustFactor, };