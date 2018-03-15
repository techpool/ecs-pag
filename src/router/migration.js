const
	express = require('express'),
    router = express.Router();
    
const
    stage = process.env.STAGE || 'local',
    routeConfig = require('./../config/route'),
    isSgp = process.env.isSgp;

const
    pipeUtil = require('./../util/pipe');

router.use((req, res, next) => {

    // If its not Singapore
    if (!isSgp) {
        return next();
    }

    // Api Path not supported
    if (!routeConfig[req.path]) {
        return next();
    }

    // Api Method not supported
    if (!routeConfig[req.path][req.method]) {
        return next();
    }

    // Stop traffic
    if (routeConfig[req.path][req.method]['stopTraffic']) {
        return res.status(503).json({
            message: 'Service Unavailable! Please try again later!'
        });
    }

    // Api supported in Mumbai
    if (!routeConfig[req.path][req.method]['pipeToSgp']) {
        return next();
    }

    // Pipe to Sgp
    return pipeUtil.pipeToSgp(req, res);

});

module.exports = router;
