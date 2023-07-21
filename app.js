require('dotenv').config();
var smartsheet = require('smartsheet');
var csv = require('csv-parser'); // Make sure to install this with npm install csv-parser
var fs = require('fs');

var options = {
    accessToken: process.env.SMARTSHEET_ACCESS_TOKEN,
    logLevel: 'info'
};

var client = smartsheet.createClient(options);

var reportId = 2424102226028420;

client.reports.getReportAsCSV({id: reportId})
    .then(function(csvData) {
        fs.writeFile('report.csv', csvData, function(err) {
            if(err) {
                console.error('Error writing CSV file', err);
                return;
            }

            var results = [];
            fs.createReadStream('report.csv')
            .pipe(csv({
                mapHeaders: ({ header }) => header.toLowerCase().replace(/\s/g, '_') // changes "Job Reference" to "job_reference", "Sheet Name" to "sheet_name", etc.
            }))
            .on('data', (data) => {
                if (data.project_type === 'Private') {  // Add this condition
                    results.push(data);
                }
            })
            .on('end', () => {
                console.log(results);
            });
        });
    })
    .catch(function(error) {
        console.log(error);
    });
