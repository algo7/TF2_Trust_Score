// Dependencies
const { Schema, } = require('mongoose');

// Create User Schema
const PlayerSchema = new Schema({
    // Fields that will alwaus ne present
    trustFactor: {
        type: Number,
        required: true,
    },
    profileVsibility: {
        type: Boolean,
        required: true,
    },
    steamLevel: {
        type: Number,
        required: true,
    },
    VACBanned: {
        type: Number,
        required: true,
    },
    NumberOfVACBans: {
        type: Number,
        required: true,
    },
    // Optional Fields
    timeSinceCreation: {
        type: Number,
    },
    gameCount: {
        type: Number,
    },
    friendVACBanPercentage: {
        type: Number,
    },
    commentSentimentScore: {
        type: Number,
    },
    totalHours: {
        type: Number,
    },
    totalHoursLinux: {
        type: Number,
    },
    totalHoursLinuxPercentage: {
        type: Number,
    },
    friendCount: {
        type: Number,
    },
    playerSummary: {
        // Fields that will always be present
        steamid: {
            type: String,
            required: true,
        },
        communityvisibilitystate: {
            type: Number,
            required: true,
        },
        profilestate: {
            type: Number,
            required: true,
        },
        personaname: {
            type: String,
            required: true,
        },
        profileurl: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        },
        avatarmedium: {
            type: String,
            required: true,
        },
        avatarfull: {
            type: String,
            required: true,
        },
        avatarhash: {
            type: String,
            required: true,
        },
        personastate: {
            type: Number,
            required: true,
        },
        // Optional Fields
        lastlogoff: {
            type: Number,
        },
        commentpermission: {
            type: Number,
        },
        timecreated: {
            type: Number,
        },
        primaryclanid: {
            type: String,
        },
        realname: {
            type: String,
        },
        personastateflags: {
            type: Number,
        },
        loccountrycode: {
            type: String,
        },
        locstatecode: {
            type: String,
        },
        loccityid: {
            type: String,
        },

    },

    lastUpdated: {
        type: Date,
        required: true,
        default: Date.now(),
    },

}, {
    collection: 'Players',
    timestamps: true,
});

// Err Handling Middleware
PlayerSchema.post('save', (error, doc, next) => {
    if (error.name === 'MongoServerError' && error.code === 11000) {
        next(`Duplicate ${Object.keys(error.keyValue)[0]}`);
    } else {
        next();
    }
});

module.exports = { PlayerSchema, };

// Validation Doc: https://mongoosejs.com/docs/validation.html