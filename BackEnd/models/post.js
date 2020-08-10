const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Words = require("../models/filteration");
const User = require("../models/user");
const notificationController = require('../controller/notification');

const postSchema = new Schema({
    userid: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String
    },
    img: {
        type: String
    },
    unhealthy: {
        type: Boolean
    },
    notifyusers: {
        type: Boolean,
        default: false
    },
    createdat: {
        type: Date,
        default: Date.now
    },
    updatedat: {
        type: Date,
        default: Date.now
    }
});

postSchema.pre('save', async function(next) {
    console.log('in pre save')
    if(this.text === null && this.img === null) {
        var err = new Error('Post should contain text or img');
        next(err);
    }
    console.log('in pre save')
    console.log('this', this)

    this.unhealthy = false;

    let data = this.toObject();

    if (data.hasOwnProperty('text')) {
        console.log('in pre save text')
        const postWordsList = this.text.split(" ");
        const wordsList = await Words.find();
        console.log(wordsList);
        wordsList.forEach(wordObj => {
            postWordsList.forEach(element => {
                if (element == wordObj.word) {
                    this.unhealthy = true;
                    updateUnhealthyPostsNum(this.userid);
                    return;
                }
            });
        });
    }
});

async function updateUnhealthyPostsNum(userid) {
    await User.findOneAndUpdate({ _id: userid }, { $inc: { unhealthypostsnum: 1 } }, {new: true });
};

// postSchema.post('save', async function(next) {
//     notificationController.notifyUsers(this);
// });

postSchema.index({ userid: 1 }, { sparse: true });

module.exports = mongoose.model('Post', postSchema);
