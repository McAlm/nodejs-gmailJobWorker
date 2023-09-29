const { writeFileSync } = require('fs')
const ics = require('ics')

//const createIcs = async (event) => {
async function createIcs() {
    console.log("Creating ICS file");
    ics.createEvent({
        title: 'Dienstreise',
        description: 'Reise nach Nürnberg',
        busyStatus: 'FREE',
        start: [2023, 9, 28, 9, 29],
        duration: { days: 1 }
    }, (error, value) => {
        if (error) {
            console.log(error)
        }

        writeFileSync(`${__dirname}/event.ics`, value)
    })
}

exports.createIcs = createIcs;