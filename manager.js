var async = require('async');
const {exec} = require ('child_process');
var args = require('minimist')(process.argv.slice(2));
const backstopFile = require('./start.js');



const referenceFlu = 'https://flutter.dev', referenceWeb = 'https://web.dev';
var stagingLink, typeTest;

stagingLink = args.s;
typeTest = args.t;

function executeTest()
{
    stagingLink = getValidStagingLink();

    if (stagingLink.includes('flutter'))
    {
        if (typeTest == 'b')
        {
          executeBackstop(referenceFlu,stagingLink);
        }

           /*() async.series([
                function(callback) {
                    exec('npm run test-backstop')
                    console.log("testi")
                    //callback()
                }
            ]
            ,function (err) {
                // Here, results is an array of the value from each function
                console.log(err); // outputs: ['two', 'five']
            })


        else if (typeTest == 'w')
        {
            console.log('\x1b[36m%s\x1b[0m',' *** Building Webhint Flutter configuration file *** ');

        }else if (typeTest == 'a')
        {
            console.log('\x1b[36m%s\x1b[0m',' *** Building Backstop and Webhint configuration file *** ');

        } else
        console.log("   ***    Opcion no valida   ***"); */

    } else if(stagingLink.includes('web'))
    {
        if(typeTest == 'b')
        {
            executeBackstop(referenceWeb,stagingLink);

        }/*else if (typeTest == 'w')
        {
            console.log('\x1b[36m%s\x1b[0m',' *** Building Backstop Web.dev configuration file *** ');

        }else if (typeTest == 'a')
        {
            console.log('\x1b[36m%s\x1b[0m',' *** Building Backstop Web.dev configuration file *** ');
        }else
        console.log("   ***    Opcion no valida   ***");*/
    }else
        console.log("   ***    Opcion no valida   ***");

}

function getValidStagingLink(){
    console.log('\x1b[36m%s\x1b[0m', "Confirm valid staging link");
    var num = stagingLink.indexOf(".com");
    return stagingLink.slice(0,num+4);


}

function executeBackstop(reference,test){


    backstopFile.buildBackstopFile(reference,test);

    async.series([
        function(callback) {
            exec('npm run test-backstop');
            console.log('\x1b[36m%s\x1b[0m', "Executing BacktopsJS");
            //callback()
        }
    ]
    ,function (err) {
        // Here, results is an array of the value from each function
        console.log(err); // outputs: ['two', 'five']
    })

}

function executeWebhint(reference,stagingLink){

}

executeTest();












