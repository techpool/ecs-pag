const
	express = require('express'),
    router = express.Router();
    
const
    stage = process.env.STAGE || 'local',
    routeConfig = require('./../config/route'),
    mainConfig = require('./../config/main')[stage];

const
    pipeUtil = require('./../util/pipe');


let isSgp = process.env.isSgp;

// Hack - Checking Internal Load Balancer Endpoint
if (isSgp === undefined) {
    if (mainConfig.API_END_POINT.includes(".ap-southeast-1.elb.amazonaws.com"))
        isSgp = true;
    else if (mainConfig.API_END_POINT.includes(".ap-south-1.elb.amazonaws.com"))
        isSgp = false;
}


// Sanity checks
router.use((req, res, next) => {

    // Api Path not supported
    if (!routeConfig[req.path]) {
        return next('router');
    }

    // Api Method not supported
    if (!routeConfig[req.path][req.method]) {
        return next('router');
    }

    return next();

});

// Stopping traffic
router.use((req, res, next) => {

    // Stop traffic
    if (routeConfig[req.path][req.method]['stopTraffic']) {
        return res.status(503).json({
            message: 'Service Unavailable! Please try again later!'
        });
    }

    return next();

});

// Migration -> backwards call to Singapore
router.use((req, res, next) => {

    // If its Singapore
    if (isSgp) {
        return next();
    }

    // If stage is devo - Ecs moved to Mumbai
    if (stage === 'devo') {
        return next();
    }

    // Api supported in Mumbai
    if (!routeConfig[req.path][req.method]['pipeToSgp']) {
        return next();
    }

    // Pipe to Sgp
    return pipeUtil.pipeToSgp(req, res);

});

module.exports = router;
