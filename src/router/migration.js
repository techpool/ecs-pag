const
    express = require('express'),
    router = express.Router();
    
const
    stage = process.env.STAGE || 'local',
    routeConfig = require('./../config/route'),
    mainConfig = require('./../config/main')[stage];

const
    pipeUtil = require('./../util/pipe');


let isSgp = process.env.isSgp === "true";

// Hack - Checking Internal Load Balancer Endpoint
// if (isSgp === undefined) {
//     if (mainConfig.API_END_POINT.includes(".ap-southeast-1.elb.amazonaws.com"))
//         isSgp = true;
//     else if (mainConfig.API_END_POINT.includes(".ap-south-1.elb.amazonaws.com"))
//         isSgp = false;
// }


// Setting res.locals[api]
router.use((req, res, next) => {
    res.locals['api'] = req.path.startsWith('/api') ? req.path.substr(4) : req.path;
    return next();
});

// Sanity checks
router.use((req, res, next) => {

    // Api Path not supported
    if (!routeConfig[res.locals['api']]) {
        return next('router');
    }

    // Api Method not supported
    if (!routeConfig[res.locals['api']][req.method]) {
        return next('router');
    }

    return next();

});

// Stopping traffic
router.use((req, res, next) => {

    // Stop traffic
    if (routeConfig[res.locals['api']][req.method]['stopTraffic']) {
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
    if (!routeConfig[res.locals['api']][req.method]['pipeToSgp']) {
        return next();
    }

    // Pipe to Sgp
    return pipeUtil.pipeToSgp(req, res);

});

module.exports = router;
