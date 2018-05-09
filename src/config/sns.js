var config = {};

config.devo = {};
config.devo.REGION = process.env.SNS_REGION;
config.devo.TOPIC = process.env.SNS_ARN;

config.gamma = {};
config.gamma.REGION = process.env.SNS_REGION;
config.gamma.TOPIC = process.env.SNS_ARN;

config.prod = {};
config.prod.REGION = process.env.SNS_REGION;
config.prod.TOPIC = process.env.SNS_ARN;

config.local = {};
config.local.REGION = 'ap-southeast-1';
config.local.TOPIC = 'arn:aws:sns:ap-southeast-1:381780986962:devo-ecs-sot';

module.exports = config;
