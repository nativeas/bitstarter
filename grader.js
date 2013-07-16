#!/usr/bin/env node


var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require("restler");
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var assertURLExists =function(inUrl){
    var instr = inUrl.toString();

}
var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkRemoteHtmlFile = function(url,checksfile){
  rest.get(url.toString()).on("complete",function(result,response){
    var cheio =cheerio.load(response)
    var checks=loadChecks(checksfile).sort();
    var  out={};
    for (var ii in checks){
      var present = cheio(checks[ii]).length>0;
      out[checks[ii]] = present;
    }
    console.log(out)
    return out;
  })
}

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-u, --url <url_file>','URL to FIle')
        .parse(process.argv);
    
    var checkJson =checkRemoteHtmlFile(program.url, program.checks);
    //var outJson = JSON.stringify(checkJson, null, 4);
   // console.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
