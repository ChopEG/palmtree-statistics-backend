let moment = require('moment');

module.exports = class MessgeModel {
    constructor({user, text}) {
        this.user = user;
        this.text = text;
        this.time = moment();
        this.timePrity = this.time.format('HH:MM:SS DD.MMM.YYY');
    }
};